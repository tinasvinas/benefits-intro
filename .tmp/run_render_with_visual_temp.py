from pathlib import Path
import runpy
import sys
import tempfile


VISUAL_TEMP = Path(r"C:\Users\46114\.codex\visualizations\2026\07\24\019f942d-c1c0-78e0-a650-77071eb9ed37\docx-render-temp")


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: run_render_with_visual_temp.py <script> [args...]")
    VISUAL_TEMP.mkdir(parents=True, exist_ok=True)
    tempfile.tempdir = str(VISUAL_TEMP)
    target = sys.argv[1]
    sys.argv = [target, *sys.argv[2:]]
    runpy.run_path(target, run_name="__main__")


if __name__ == "__main__":
    main()
