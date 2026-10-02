(async function() {
    // Esperar a que Spicetify esté disponible y cargado
    while (!(window.Spicetify && window.Spicetify.Player && window.Spicetify.getAudioData)) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const EXTENSION_VERSION = "1.1.3";
    console.log(`[Brazilian Dog] Versión corriendo: ${EXTENSION_VERSION}`);
    
    const CONFIG = {
        spriteUrl: "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/Sprites.png",
        containerId: "brazilian-dog-container",
        menuId: "brazilian-dog-menu",
        totalFrames: 11,
        cols: 4,
        frameSize: 40,
        skins: {
            "Normal": "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/Sprites.png",
            "Sombrero": "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/Sprites_sombrero1.png",
            "Lentes": "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/Sprites_lentes1.png",
            "Gafas de sol": "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/Sprites_lentes2.png",
            "Deportivo": "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/Sprites_deportivo1.png",
        },
        sfxUrls: [
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/Laser_dancehall.mp3", // 0
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/Siren-Sound2.mp3",     // 1
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/airhorn.mp3",         // 2
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/hey-dj-sound.mp3",    // 3 (Hey)
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/leo-que-momento_QLNlRxP.mp3", // 4
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/irra-ratinho.mp3",            // 5
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/fogos-caruaru-foguete-12x1-8.mp3", // 6
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/no-puede-seeer.mp3",          // 7
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/dale_1.mp3",                   // 8
            "https://raw.githubusercontent.com/WilliamDuartezzz/Brazilian-Dog-/main/assets/roblox-explosion-sound.mp3"    // 9
        ]
    };

    function injectDog() {
        const target = document.querySelector(".main-nowPlayingBar-center");
        if (!target || document.getElementById(CONFIG.containerId)) return;

        const container = document.createElement("div");
        container.id = CONFIG.containerId;
        
        Object.assign(container.style, {
            position: "absolute",
            top: "-50px",
            left: "50%",
            transform: "translateX(-50%)",
            width: CONFIG.frameSize + "px",
            height: CONFIG.frameSize + "px",
            backgroundImage: `url('${CONFIG.spriteUrl}')`,
            backgroundSize: "160px 120px",
            zIndex: "99999",
            cursor: "pointer",       
            pointerEvents: "auto"   
        });

        // Menú de contexto (click derecho)
        container.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            createMenu(e.clientX, e.clientY);
        });

        // Reproducción cíclica al hacer clic en el perro
        let soundIndex = 0; 
        container.addEventListener("click", () => {
            const currentSfx = CONFIG.sfxUrls[soundIndex];
            const audio = new Audio(currentSfx);
            audio.play();
            soundIndex = (soundIndex + 1) % CONFIG.sfxUrls.length;
        });

        target.style.position = "relative";
        target.appendChild(container);

        let frame = 0;
        let currentBpm = 120;

        // Actualización de BPM
        const updateBpm = async () => {
            try {
                const audioData = await Spicetify.getAudioData();
                currentBpm = audioData?.track?.tempo || 120;
            } catch (e) { currentBpm = 120; }
        };

        Spicetify.Player.addEventListener("songchange", updateBpm);
        updateBpm();

        function animate() {
            const isPaused = Spicetify.Player?.data?.isPaused ?? false;

            if (!isPaused) {
                const col = frame % CONFIG.cols;
                const row = Math.floor(frame / CONFIG.cols);
                container.style.backgroundPosition = `-${col * CONFIG.frameSize}px -${row * CONFIG.frameSize}px`;
                frame = (frame + 1) % CONFIG.totalFrames;
            }

            const interval = 60000 / (currentBpm * 10);
            setTimeout(animate, interval);
        }

        animate();
    }

    // Mapeo del Numpad (0 al 9) para disparar los audios directamente
    document.addEventListener("keydown", (e) => {
        const numpadMap = {
            "Numpad0": 3, // Efecto Hey
            "Numpad1": 0, // Laser dancehall
            "Numpad2": 1, // Siren Sound
            "Numpad3": 2, // Airhorn
            "Numpad4": 4, // Leo que momento
            "Numpad5": 5, // Irra ratinho
            "Numpad6": 6, // Fogos caruaru
            "Numpad7": 7, // No puede seer
            "Numpad8": 8, // Dale
            "Numpad9": 9  // Roblox explosion
        };

        if (numpadMap.hasOwnProperty(e.code)) {
            const soundIndex = numpadMap[e.code];
            if (CONFIG.sfxUrls[soundIndex]) {
                const audio = new Audio(CONFIG.sfxUrls[soundIndex]);
                audio.play();
            }
        }
    });

    function createMenu(x, y) {
        let menu = document.getElementById(CONFIG.menuId);
        if (menu) menu.remove();

        menu = document.createElement("div");
        menu.id = CONFIG.menuId;
        Object.assign(menu.style, {
            position: "fixed",
            background: "#282828",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "5px",
            zIndex: "200000",
            color: "white",
            visibility: "hidden"
        });

        Object.keys(CONFIG.skins).forEach(skinName => {
            const btn = document.createElement("div");
            btn.innerText = skinName;
            btn.style.padding = "8px 15px";
            btn.style.cursor = "pointer";
            btn.onclick = () => {
                const container = document.getElementById(CONFIG.containerId);
                if (container) container.style.backgroundImage = `url('${CONFIG.skins[skinName]}')`;
                menu.remove();
            };
            menu.appendChild(btn);
        });

        document.body.appendChild(menu);

        const menuRect = menu.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        let finalTop = y;
        let finalLeft = x;

        if (y + menuRect.height > windowHeight) {
            finalTop = y - menuRect.height;
        }

        if (x + menuRect.width > windowWidth) {
            finalLeft = windowWidth - menuRect.width - 10;
        }

        menu.style.top = finalTop + "px";
        menu.style.left = finalLeft + "px";
        menu.style.visibility = "visible";

        document.addEventListener("click", () => menu.remove(), { once: true });
    }

    const observer = new MutationObserver(injectDog);
    observer.observe(document.body, { childList: true, subtree: true });
    injectDog();
})();
