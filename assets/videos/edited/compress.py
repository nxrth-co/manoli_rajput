import os
import subprocess

def get_video_duration(input_file):
    """Gets the duration of the video in seconds using ffprobe."""
    cmd = [
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration", "-of",
        "default=noprint_wrappers=1:nokey=1", input_file
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return float(result.stdout.strip())
    except Exception as e:
        print(f"Error reading video duration. Is FFmpeg installed? Details: {e}")
        return None

def compress_video(input_file, output_file, target_size_mb):
    """Compresses a video to a target file size using 2-pass FFmpeg encoding."""
    duration = get_video_duration(input_file)
    if not duration:
        return

    # Mathematical calculation for targeted bitrate
    # Target size in kilobits = (MB * 8192)
    target_total_bitrate = (target_size_mb * 8192) / duration
    
    audio_bitrate = 128 # 128 kbps is standard for decent audio
    video_bitrate = target_total_bitrate - audio_bitrate

    if video_bitrate <= 0:
        print("Error: Target size is too small for a video of this length.")
        return

    print(f"Video Duration: {duration:.2f} seconds")
    print(f"Target Video Bitrate: {int(video_bitrate)} kbps")
    print("Starting 2-Pass Compression. This might take a few minutes...\n")

    # Pass 1: Analyzes the video to optimize where bits should be spent
    pass1_cmd = [
        "ffmpeg", "-y", "-i", input_file, 
        "-c:v", "libx264", "-b:v", f"{int(video_bitrate)}k", 
        "-pix_fmt", "yuv420p",
        "-pass", "1", "-an", "-f", "null", os.devnull
    ]
    
    # Pass 2: Actually encodes the video and adds the audio back in
    pass2_cmd = [
        "ffmpeg", "-y", "-i", input_file, 
        "-c:v", "libx264", "-b:v", f"{int(video_bitrate)}k", 
        "-pix_fmt", "yuv420p",
        "-pass", "2", 
        "-c:a", "aac", "-b:a", f"{audio_bitrate}k", 
        "-movflags", "+faststart",
        output_file
    ]

    try:
        print("Running Pass 1 (Analysis)...")
        subprocess.run(pass1_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT, check=True)
        
        print("Running Pass 2 (Encoding)...")
        subprocess.run(pass2_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT, check=True)
        
        print(f"\nSuccess! Video saved to {output_file}")
        
        # Cleanup log files created by the 2-pass process
        for log in ["ffmpeg2pass-0.log", "ffmpeg2pass-0.log.mbtree"]:
            if os.path.exists(log):
                os.remove(log)
                
    except subprocess.CalledProcessError as e:
        print("An error occurred during FFmpeg processing.")

# --- RUN THE SCRIPT HERE ---
if __name__ == "__main__":
    # Change these variables to match your files
    INPUT_VIDEO = "edited1.mp4" 
    OUTPUT_VIDEO = "compressed_30mb_1.mp4"
    TARGET_SIZE_MB = 30

    compress_video(INPUT_VIDEO, OUTPUT_VIDEO, TARGET_SIZE_MB)