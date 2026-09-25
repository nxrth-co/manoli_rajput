import os
import shutil
import stat
from pathlib import Path

TARGET_DIRS = {"node_modules", ".next", ".venv", "__pycache__"}

def remove_readonly(func, path, excinfo):
    """Clear the readonly bit and reattempt removal on Windows."""
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception as e:
        print(f"  [!] Failed to delete {path}: {e}")

def format_size(bytes_count):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_count < 1024.0:
            return f"{bytes_count:.2f} {unit}"
        bytes_count /= 1024.0
    return f"{bytes_count:.2f} PB"

def get_dir_size(path):
    total = 0
    try:
        for root, dirs, files in os.walk(path):
            for f in files:
                fp = os.path.join(root, f)
                try:
                    total += os.path.getsize(fp)
                except OSError:
                    pass
    except OSError:
        pass
    return total

def clean_documents():
    docs_dir = Path(r"C:\Users\SIS\Documents")
    print("=" * 70)
    print(f" Scanning and cleaning dependencies in: {docs_dir}")
    print(f" Target folder names: {', '.join(sorted(TARGET_DIRS))}")
    print("=" * 70 + "\n")

    total_deleted = 0
    total_freed_bytes = 0

    for root, dirs, files in os.walk(docs_dir, topdown=True):
        # Identify target directories at the current level
        to_delete = [d for d in dirs if d in TARGET_DIRS]
        
        # Prevent os.walk from recursing into folders about to be deleted
        for d in to_delete:
            dirs.remove(d)

        for d in to_delete:
            target_path = os.path.join(root, d)
            dir_size = get_dir_size(target_path)
            print(f"Deleting: {target_path} ({format_size(dir_size)})...", end="", flush=True)
            try:
                shutil.rmtree(target_path, onerror=remove_readonly)
                total_deleted += 1
                total_freed_bytes += dir_size
                print(" [DONE]")
            except Exception as e:
                print(f" [FAILED: {e}]")

    print("\n" + "=" * 70)
    print(f" Summary: Successfully removed {total_deleted} folders.")
    print(f" Total disk space freed: {format_size(total_freed_bytes)}")
    print("=" * 70)

if __name__ == "__main__":
    clean_documents()
