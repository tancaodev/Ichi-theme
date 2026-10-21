#!/usr/bin/env python3
"""Extract decision-useful evidence from Lighthouse result JSON files."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


CORE_METRICS = (
    ("first-contentful-paint", "FCP"),
    ("largest-contentful-paint", "LCP"),
    ("total-blocking-time", "TBT"),
    ("cumulative-layout-shift", "CLS"),
    ("speed-index", "Speed Index"),
    ("interactive", "Time to Interactive"),
    ("interaction-to-next-paint", "INP"),
)

OBSERVED_METRICS = (
    ("observedFirstContentfulPaint", "Observed FCP"),
    ("observedLargestContentfulPaint", "Observed LCP"),
    ("observedSpeedIndex", "Observed Speed Index"),
    ("observedCumulativeLayoutShift", "Observed CLS"),
)


def load_report(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"{path}: {error}") from error
    if not isinstance(data, dict) or "audits" not in data:
        raise ValueError(f"{path}: not a Lighthouse result JSON object")
    return data


def md(value: Any) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ").strip()


def score(value: Any) -> str:
    if not isinstance(value, (int, float)):
        return "n/a"
    return str(round(value * 100))


def human_bytes(value: Any) -> str:
    if not isinstance(value, (int, float)):
        return ""
    units = ("B", "KiB", "MiB", "GiB")
    amount = float(value)
    for unit in units:
        if abs(amount) < 1024 or unit == units[-1]:
            return f"{amount:.0f} {unit}" if unit == "B" else f"{amount:.1f} {unit}"
        amount /= 1024
    return ""


def audit_savings(audit: dict[str, Any]) -> tuple[float, float]:
    details = audit.get("details") or {}
    metric = audit.get("metricSavings") or {}
    milliseconds = details.get("overallSavingsMs")
    byte_count = details.get("overallSavingsBytes")
    if not isinstance(milliseconds, (int, float)):
        milliseconds = sum(
            value for value in metric.values() if isinstance(value, (int, float))
        )
    if not isinstance(byte_count, (int, float)):
        byte_count = 0
    return float(milliseconds or 0), float(byte_count or 0)


def node_from_items(items: Any) -> dict[str, Any] | None:
    if not isinstance(items, list):
        return None
    for item in items:
        if isinstance(item, dict) and item.get("type") == "node":
            return item
    return None


def lcp_details(audits: dict[str, Any]) -> list[str]:
    lines: list[str] = []
    discovery = audits.get("lcp-discovery-insight") or {}
    breakdown = audits.get("lcp-breakdown-insight") or {}
    discovery_items = (discovery.get("details") or {}).get("items") or []
    breakdown_items = (breakdown.get("details") or {}).get("items") or []
    node = node_from_items(discovery_items) or node_from_items(breakdown_items)
    if node:
        lines.append(f"- Element: `{md(node.get('selector') or node.get('nodeLabel') or 'unknown')}`")
    for item in discovery_items:
        if not isinstance(item, dict) or item.get("type") != "checklist":
            continue
        checks = item.get("items") or {}
        rendered = []
        for check in checks.values():
            if isinstance(check, dict):
                mark = "yes" if check.get("value") is True else "no"
                rendered.append(f"{check.get('label', 'check')}: {mark}")
        if rendered:
            lines.append(f"- Discovery: {md('; '.join(rendered))}")
    for item in breakdown_items:
        if not isinstance(item, dict) or item.get("type") != "table":
            continue
        rows = []
        for row in item.get("items") or []:
            if not isinstance(row, dict):
                continue
            duration = row.get("duration")
            if isinstance(duration, (int, float)):
                rows.append(f"{row.get('label', row.get('subpart', 'part'))} {duration:.0f} ms")
        if rows:
            lines.append(f"- Breakdown: {md('; '.join(rows))}")
    return lines


def forced_reflows(audits: dict[str, Any]) -> list[tuple[str, float]]:
    audit = audits.get("forced-reflow-insight") or {}
    entries: list[tuple[str, float]] = []
    for table in ((audit.get("details") or {}).get("items") or []):
        if not isinstance(table, dict) or table.get("type") != "table":
            continue
        for row in table.get("items") or []:
            if not isinstance(row, dict):
                continue
            duration = row.get("reflowTime")
            source = row.get("source") or {}
            if not isinstance(duration, (int, float)) or not isinstance(source, dict):
                continue
            if source.get("type") == "source-location":
                location = source.get("url", "unknown")
                if source.get("line") is not None:
                    location += f":{source['line']}"
            else:
                location = source.get("value", "unknown")
            entries.append((location, float(duration)))
    entries.sort(key=lambda item: item[1], reverse=True)
    return entries


def report_markdown(path: Path, report: dict[str, Any]) -> str:
    audits = report.get("audits") or {}
    config = report.get("configSettings") or {}
    categories = report.get("categories") or {}
    url = report.get("finalDisplayedUrl") or report.get("finalUrl") or report.get("requestedUrl") or "unknown"
    form_factor = config.get("formFactor") or report.get("environment", {}).get("formFactor") or "unknown"
    throttling = config.get("throttlingMethod") or "unknown"

    lines = [
        f"## {md(path.name)}",
        "",
        f"- URL: {md(url)}",
        f"- Fetch time: {md(report.get('fetchTime', 'unknown'))}",
        f"- Lighthouse: {md(report.get('lighthouseVersion', 'unknown'))}",
        f"- Profile: {md(form_factor)}; throttling: {md(throttling)}",
        "",
        "### Scores and metrics",
        "",
        "| Item | Value | Score |",
        "|---|---:|---:|",
    ]
    for name, category in categories.items():
        if isinstance(category, dict):
            lines.append(f"| {md(category.get('title') or name)} | - | {score(category.get('score'))} |")
    for audit_id, label in CORE_METRICS:
        audit = audits.get(audit_id)
        if not isinstance(audit, dict):
            continue
        display = audit.get("displayValue")
        if display is None:
            display = audit.get("numericValue", "n/a")
        lines.append(f"| {label} | {md(display)} | {score(audit.get('score'))} |")

    metric_rows = ((audits.get("metrics") or {}).get("details") or {}).get("items") or []
    trace_metrics = metric_rows[0] if metric_rows and isinstance(metric_rows[0], dict) else {}
    observed = []
    for key, label in OBSERVED_METRICS:
        value = trace_metrics.get(key)
        if not isinstance(value, (int, float)):
            continue
        rendered = f"{value:.0f} ms" if key != "observedCumulativeLayoutShift" else f"{value:.3f}"
        observed.append((label, rendered))
    if observed:
        lines.extend([
            "",
            "### Observed trace metrics",
            "",
            "Headline values above may be simulated/modelled; these are unthrottled trace observations.",
            "",
            "| Item | Value |",
            "|---|---:|",
        ])
        lines.extend(f"| {label} | {value} |" for label, value in observed)

    lcp = lcp_details(audits)
    if lcp:
        lines.extend(["", "### LCP evidence", "", *lcp])

    candidates = []
    for audit_id, audit in audits.items():
        if not isinstance(audit, dict) or audit.get("score") is None or audit.get("score", 1) >= 0.9:
            continue
        mode = audit.get("scoreDisplayMode")
        if mode not in {"numeric", "binary", "metricSavings"}:
            continue
        milliseconds, byte_count = audit_savings(audit)
        candidates.append((milliseconds, byte_count, audit_id, audit))
    candidates.sort(key=lambda item: (item[0], item[1], -float(item[3].get("score") or 0)), reverse=True)

    if candidates:
        lines.extend([
            "",
            "### Failed or actionable audits",
            "",
            "| Audit | Score | Display | Estimated savings |",
            "|---|---:|---|---:|",
        ])
        for milliseconds, byte_count, audit_id, audit in candidates[:15]:
            savings = []
            if milliseconds:
                savings.append(f"{milliseconds:.0f} ms")
            if byte_count:
                savings.append(human_bytes(byte_count))
            lines.append(
                f"| `{md(audit_id)}` — {md(audit.get('title', ''))} | "
                f"{score(audit.get('score'))} | {md(audit.get('displayValue') or '')} | "
                f"{md(', '.join(savings) or '-')} |"
            )

    reflows = forced_reflows(audits)
    if reflows:
        lines.extend([
            "",
            "### Forced-reflow sources",
            "",
            "These locations require ownership/source mapping before a fix.",
            "",
            "| Source | Reflow time |",
            "|---|---:|",
        ])
        for location, duration in reflows[:10]:
            lines.append(f"| `{md(location)}` | {duration:.1f} ms |")

    requests = ((audits.get("network-requests") or {}).get("details") or {}).get("items") or []
    requests = [item for item in requests if isinstance(item, dict)]
    requests.sort(key=lambda item: item.get("transferSize") or 0, reverse=True)
    if requests:
        lines.extend([
            "",
            "### Largest transfers",
            "",
            "| Host/path | Type | Transfer |",
            "|---|---|---:|",
        ])
        for item in requests[:10]:
            request_url = item.get("url") or "unknown"
            parsed = urlparse(request_url)
            short_url = f"{parsed.netloc}{parsed.path}"
            lines.append(
                f"| `{md(short_url[:120])}` | {md(item.get('resourceType', ''))} | "
                f"{human_bytes(item.get('transferSize'))} |"
            )

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reports", nargs="+", type=Path, help="Lighthouse JSON report paths")
    parser.add_argument("-o", "--output", type=Path, help="write Markdown to this path")
    args = parser.parse_args()

    sections = ["# Lighthouse evidence summary"]
    try:
        for path in args.reports:
            sections.extend(["", report_markdown(path, load_report(path))])
    except ValueError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 2

    result = "\n".join(sections) + "\n"
    if args.output:
        args.output.write_text(result, encoding="utf-8")
    else:
        print(result, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
