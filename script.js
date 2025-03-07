document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const videoElement = document.getElementById('videoElement');
    const messageOverlay = document.getElementById('messageOverlay');
    const startButton = document.getElementById('startButton');
    const micButton = document.getElementById('micButton');
    const initialPrompt = document.getElementById('initial-prompt');
    const namePrompt = document.getElementById('name-prompt');
    const messageArea = document.getElementById('message-area');
    const greeting = document.getElementById('greeting');
    const personalMessage = document.getElementById('personal-message');
    const newMessageButton = document.getElementById('newMessageButton');
    const restartButton = document.getElementById('restartButton');
    const listeningIndicator = document.getElementById('listening-indicator');
    const statusText = document.getElementById('status-text');
    
    // Variables
    let userName = '';
    let recognition;
    
    // Inspirational messages for International Women's Day
    const messages = [
        "Your strength and resilience make the world a better place every day.",
        "Your voice matters. Your dreams matter. Your existence matters.",
        "Today and every day, your unique perspective and contributions change the world.",
        "Behind every successful woman is herself, and we celebrate your journey today.",
        "You embody courage, compassion, and power in everything you do.",
        "Your potential is limitless - never forget how capable and extraordinary you are.",
        "You are not just part of history; you are actively creating it.",
        "The world is better because you're in it, sharing your unique gifts and talents.",
        "Your determination and spirit inspire everyone around you.",
        "Today we celebrate the amazing woman you are and all the women who paved the way.",
        "Like countless remarkable women throughout history, you too are making your mark.",
        "Your journey is uniquely yours, and it's beautiful in all its complexity.",
        "The strength you show every day breaks barriers and creates opportunities for others.",
        "Your compassion and courage make you a force for positive change in this world.",
        "Today we honor all you've overcome and all you continue to achieve."
    ];
    
    // Initialize camera
    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            videoElement.srcObject = stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access your camera. Please grant permission to continue.');
        }
    }
    
    // Initialize speech recognition
    function initSpeechRecognition() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!window.SpeechRecognition) {
            alert('Speech recognition is not supported in your browser. Try using Chrome or Edge.');
            return false;
        }
        
        recognition = new window.SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            listeningIndicator.classList.add('active');
            statusText.textContent = 'Listening...';
            micButton.textContent = 'Listening...';
            micButton.disabled = true;
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            processName(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            listeningIndicator.classList.remove('active');
            statusText.textContent = 'Error. Try again?';
            micButton.textContent = 'Try Again';
            micButton.disabled = false;
        };
        
        recognition.onend = () => {
            listeningIndicator.classList.remove('active');
            micButton.disabled = false;
        };
        
        return true;
    }
    
    // Process the name from speech recognition
    function processName(transcript) {
        userName = transcript.trim();
        
        // Simple processing to get first name if full name was given
        if (userName.includes(' ')) {
            userName = userName.split(' ')[0];
        }
        
        // Capitalize first letter
        userName = userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase();
        
        statusText.textContent = `Hello, ${userName}!`;
        
        setTimeout(() => {
            namePrompt.classList.add('hidden');
            greeting.textContent = `Hello, ${userName}!`;
            displayMessage();
            messageArea.classList.remove('hidden');
        }, 1000);
    }
    
    // Display a random positive message
    function displayMessage() {
        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];
        personalMessage.textContent = message;
        
        // Speak the message
        speakMessage(`Hello ${userName}. ${message}`);
        
        // Show overlay effect
        messageOverlay.classList.add('active');
        setTimeout(() => {
            messageOverlay.classList.remove('active');
        }, 3000);
    }
    
    // Text-to-speech function
    function speakMessage(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95; // Slightly slower than default
            utterance.pitch = 1.1; // Slightly higher pitch
            
            // Get voices and try to set a female voice if available
            window.speechSynthesis.onvoiceschanged = () => {
                const voices = window.speechSynthesis.getVoices();
                const femaleVoice = voices.find(voice => 
                    voice.name.includes('female') || 
                    voice.name.includes('Samantha') ||
                    voice.name.includes('Zira') ||
                    voice.name.includes('Victoria')
                );
                
                if (femaleVoice) {
                    utterance.voice = femaleVoice;
                }
            };
            
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // Event Listeners
    startButton.addEventListener('click', () => {
        initCamera();
        initialPrompt.classList.add('hidden');
        namePrompt.classList.remove('hidden');
        
        // Initialize speech recognition
        if (!initSpeechRecognition()) {
            // Fallback if speech recognition isn't available
            namePrompt.innerHTML = `
                <h2>What's your name?</h2>
                <input type="text" id="nameInput" placeholder="Enter your name">
                <button id="submitNameButton" class="primary-button">Submit</button>
            `;
            
            document.getElementById('submitNameButton').addEventListener('click', () => {
                userName = document.getElementById('nameInput').value.trim();
                if (userName) {
                    processName(userName);
                }
            });
        }
    });
    
    micButton.addEventListener('click', () => {
        if (recognition) {
            recognition.start();
        }
    });
    
    newMessageButton.addEventListener('click', displayMessage);
    
    restartButton.addEventListener('click', () => {
        messageArea.classList.add('hidden');
        initialPrompt.classList.remove('hidden');
        
        // Stop any ongoing speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        // Stop camera stream
        if (videoElement.srcObject) {
            const tracks = videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    });
});