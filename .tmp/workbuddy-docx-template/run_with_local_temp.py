from pathlib import Path
import runpy
import sys
import tempfile


def main():
    if len(sys.argv) < 2:
        raise SystemExit("usage: run_with_local_temp.py <script> [args...]")
    local_temp = Path(__file__).resolve().parent / "runtime-temp"
    local_temp.mkdir(parents=True, exist_ok=True)
    tempfile.tempdir = str(local_temp)
    target = sys.argv[1]
    sys.argv = [target, *sys.argv[2:]]
    runpy.run_path(target, run_name="__main__")


if __name__ == "__main__":
    main()
