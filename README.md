### Generating The alphabet.mp3/ogg files.

Using Audacity I manually went through and extracted a track for each of Griffin's letters. I could then just use Audacity's "Export Multiple..." to get an individual mp3 for each letter (see raw-audio/letters).

These individual letter mp3s were then concatenated with a small gap of silence in between using `ffmpeg`:

`ffmpeg -f concat -safe 0 -i input.txt -c copy alphabet.mp3`

where `input.txt` looked something like:

```txt
file '/some/path/mbmbalphabet/raw-audio/letters/a.mp3'
file '/some/path/mbmbalphabet/raw-audio/silence.mp3'
file '/some/path/mbmbalphabet/raw-audio/letters/b.mp3'
file '/some/path/mbmbalphabet/raw-audio/silence.mp3'
...
file '/some/path/mbmbalphabet/raw-audio/letters/y.mp3'
....
```

I then generated an ogg version for Firefox/Chrome using:

`ffmpeg  -i alphabet.mp3 -c:a libvorbis -q:a 4 alphabet.ogg`

### Generating Start Times:

Generating the start times for each file was done by running the following command for each raw letter file:

`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 letters/<letter>.mp3`

I then ran a simple script using the length of each letter (plus about 146ms of silence) to calculate the start times for each file:
