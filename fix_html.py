lines = open('index.html').read().split('\n')
idx = -1
for i, line in enumerate(lines):
    if 'id="how-it-works-res-tri"' in line:
        idx = i
        break

start = idx
end = idx + 25

new_block = """                    <div class="how-it-works-result" id="how-it-works-res-tri">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>Design right, first time</span>
                    </div>
                </div> <-- Preferences closes how-it-works-path-tri -->
            </div> <-- Preferences closes how-it-works-paths -->
            
            <-- Preferences Mobile Slider Handle -->
            <div class="hiw-slider-handle" id="hiw-slider-handle">
                <div class="hiw-slider-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </div>
            </div>
            
        </div> <-- Preferences closes how-it-works-slider-wrapper -->
        </div> <-- Preferences closes how-it-works-scene -->
    </section>"""

# find section close
for i in range(idx, idx+30):
    if '</section>' in lines[i]:
        end = i
        break

# replace lines[start:end+1] with new_block
lines = lines[:start] + new_block.split('\n') + lines[end+1:]
open('index.html', 'w').write('\n'.join(lines))
