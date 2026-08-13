import os
import subprocess
import glob

def convert_to_hls(input_file):
    print(f"Processing {input_file}...")
    
    # Get the directory and filename without extension
    dir_name = os.path.dirname(input_file)
    base_name = os.path.basename(input_file)
    name_without_ext = os.path.splitext(base_name)[0]
    
    # Output playlist file
    output_playlist = os.path.join(dir_name, f"{name_without_ext}.m3u8")
    
    # We will output the .m3u8 and .ts files directly next to the original mp4
    
    # Command for ffmpeg HLS chunking (using 4 seconds segments for quick loading)
    # Using reasonably good preset and saving original resolution/quality as best as possible
    cmd = [
        "ffmpeg", "-y", "-i", input_file,
        "-c:v", "copy",
        "-c:a", "copy",
        "-start_number", "0",
        "-hls_time", "4",
        "-hls_list_size", "0",
        "-f", "hls",
        output_playlist
    ]
    
    try:
        # Run ffmpeg command
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"Successfully created HLS for {base_name}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to process {base_name}: {e}")
        
def main():
    # Find all mp4 files in edited and raw directories
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    edited_dir = os.path.join(base_dir, "edited")
    raw_dir = os.path.join(base_dir, "raw")
    
    mp4_files = []
    if os.path.exists(edited_dir):
        mp4_files.extend(glob.glob(os.path.join(edited_dir, "*.mp4")))
        
    if os.path.exists(raw_dir):
        mp4_files.extend(glob.glob(os.path.join(raw_dir, "*.mp4")))
        
    if not mp4_files:
        print("No .mp4 files found.")
        return
        
    print(f"Found {len(mp4_files)} .mp4 files. Starting HLS conversion...")
    
    for file in mp4_files:
        convert_to_hls(file)
        
    print("Done processing all videos.")

if __name__ == "__main__":
    main()
