/* SYNAPEX LAB — Speech Recognition Module */
window.SynapexLab = window.SynapexLab || {};
SynapexLab.initSpeech = function (el) {
  var toggle = SynapexLab.toggle, range = SynapexLab.range, sel = SynapexLab.sel, num = SynapexLab.num, wireRanges = SynapexLab.wireRanges;
  el.innerHTML = `
    <div class="tm-grid">
      <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent)">3.2%</div><div class="tm-stat-lbl">WER (English)</div></div>
      <div class="tm-stat"><div class="tm-stat-val" style="color:var(--accent2)">42</div><div class="tm-stat-lbl">Languages</div></div>
      <div class="tm-stat"><div class="tm-stat-val" style="color:var(--gold)">&lt;200ms</div><div class="tm-stat-lbl">Latency (stream)</div></div>
      <div class="tm-stat"><div class="tm-stat-val" style="color:var(--purple)">890 MB</div><div class="tm-stat-lbl">Model Size</div></div>
    </div>

    <div class="tm-split">
      <div>
        <div class="tm-params">
          <div class="tm-params-title">Audio Input</div>
          ${sel('srSource', 'Input Source', [{v:'mic',t:'Microphone (real-time)',s:true},'Audio File Upload','Streaming URL (RTSP/WebSocket)','Batch Directory'])}
          ${sel('srSampleRate', 'Sample Rate', ['8000 Hz (telephony)',{v:'16000',t:'16000 Hz (default)',s:true},'22050 Hz','44100 Hz','48000 Hz'])}
          ${sel('srChannels', 'Channels', [{v:'mono',t:'Mono',s:true},'Stereo','Multi-channel (array)'])}
          ${range('srChunkSize', 'Stream Chunk Duration (ms)', 100, 5000, 1000, 100, 'ms')}
          ${toggle('srVAD', 'Voice Activity Detection', 'Silero VAD for speech/non-speech segmentation', true)}
          ${range('srVADThresh', 'VAD Sensitivity', 0.1, 0.9, 0.5, 0.05, '')}
        </div>

        <div class="tm-params" style="margin-top:14px;">
          <div class="tm-params-title">Language & Model</div>
          ${sel('srModel', 'ASR Model', ['Whisper-tiny (39M)','Whisper-base (74M)',{v:'whisper-medium',t:'Whisper-medium (769M)',s:true},'Whisper-large-v3 (1.5B)','Wav2Vec2-XLSR','Conformer-CTC'])}
          ${sel('srLang', 'Primary Language', [{v:'en',t:'English',s:true},'Spanish','French','German','Polish','Japanese','Chinese (Mandarin)','Arabic','Hindi','Auto-detect'])}
          ${toggle('srMultilang', 'Multilingual Mode', 'Handle code-switching between languages', false)}
          ${toggle('srTranslate', 'Translate to English', 'Translate non-English speech to English text', false)}
        </div>
      </div>

      <div>
        <div class="tm-params">
          <div class="tm-params-title">Post-Processing</div>
          ${toggle('srPunct', 'Punctuation Restoration', 'Insert commas, periods, question marks', true)}
          ${toggle('srCapital', 'True-Casing', 'Capitalize proper nouns and sentence starts', true)}
          ${toggle('srDiarize', 'Speaker Diarization', 'Identify and label different speakers', false)}
          ${num('srMaxSpeakers', 'Max Speakers (diarization)', 4, 2, 20, 1)}
          ${toggle('srTimestamps', 'Word-level Timestamps', 'Alignment of each word to audio timeline', true)}
          ${toggle('srConfidence', 'Word Confidence Scores', 'Per-word probability for quality filtering', false)}
        </div>

        <div class="tm-params" style="margin-top:14px;">
          <div class="tm-params-title">Noise & Enhancement</div>
          ${toggle('srDenoise', 'Noise Suppression', 'Neural noise reduction (RNNoise / DeepFilterNet)', true)}
          ${sel('srDenoiseModel', 'Noise Model', [{v:'rnnoise',t:'RNNoise (fast)',s:true},'DeepFilterNet2 (quality)','PercepNet'])}
          ${toggle('srDereverb', 'Dereverberation', 'Reduce room echo for cleaner transcription', false)}
          ${toggle('srAGC', 'Automatic Gain Control', 'Normalize audio volume levels', true)}
        </div>

        <div class="tm-params" style="margin-top:14px;">
          <div class="tm-params-title">Output</div>
          ${sel('srFormat', 'Transcript Format', [{v:'plain',t:'Plain Text',s:true},'SRT (subtitles)','VTT (web subtitles)','JSON (structured)','CTM (time-aligned)'])}
          ${sel('srEncoding', 'Text Encoding', [{v:'utf8',t:'UTF-8',s:true},'ASCII','ISO-8859-1'])}
        </div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
      <button class="tm-btn">Start Transcription</button>
      <button class="tm-btn outline">Test Microphone</button>
      <button class="tm-btn outline">Export Config</button>
    </div>
  `;
  wireRanges(el);
};
