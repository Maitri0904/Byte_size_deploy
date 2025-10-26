// Global variables
let currentUser = null;
let userPlan = null;
let isChatbotOpen = false;

// Google Sheets configuration
const GOOGLE_SHEETS_CONFIG = {
    // Replace with your Google Apps Script Web App URL
    WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    // This is a demo URL - you'll need to create your own Google Apps Script
    DEMO_MODE: true
};

// Course data with YouTube links
const courseData = {
    'ai-beginners': {
        title: 'AI for Beginners – Daily Life Edition',
        goal: 'Learn to use AI tools to save 1–2 hours daily',
        modules: [
            {
                name: 'ChatGPT for writing, brainstorming & summarizing',
                duration: '25 min',
                youtubeLink: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
                description: 'Master ChatGPT for content creation, idea generation, and document summarization'
            },
            {
                name: 'Perplexity AI for research',
                duration: '20 min',
                youtubeLink: 'https://www.youtube.com/watch?v=aYuoEHOC1kM',
                description: 'Learn advanced research techniques using Perplexity AI for accurate information gathering'
            },
            {
                name: 'Notion AI for task management',
                duration: '30 min',
                youtubeLink: 'https://www.youtube.com/watch?v=O8qdvSxDYNY',
                description: 'Organize your life and work with AI-powered task management in Notion'
            },
            {
                name: 'Otter.ai for meeting/class summaries',
                duration: '15 min',
                youtubeLink: 'https://www.youtube.com/watch?v=yoXgFx4F3rM',
                description: 'Automatically transcribe and summarize meetings, lectures, and conversations'
            },
            {
                name: 'GrammarlyGO & QuillBot for writing improvement',
                duration: '22 min',
                youtubeLink: 'https://www.youtube.com/watch?v=ZQvfHl-7X48',
                description: 'Enhance your writing with AI-powered grammar checking and paraphrasing tools'
            }
        ]
    },
    'prompt-engineering': {
        title: 'Prompt Engineering Bootcamp',
        goal: 'Learn how to talk to AI to get the BEST outputs',
        modules: [
            {
                name: 'Basic prompts (questions, commands, rewriting)',
                duration: '22 min',
                youtubeLink: 'https://www.youtube.com/watch?v=_VjQlb8GvhI',
                description: 'Master fundamental prompting techniques for clear AI communication'
            },
            {
                name: 'Role-based prompting ("Act as a trader/teacher")',
                duration: '28 min',
                youtubeLink: 'https://www.youtube.com/watch?v=jC4v5AS4RIM',
                description: 'Use role-based prompts to get specialized expert responses from AI'
            },
            {
                name: 'Chain prompts for research',
                duration: '35 min',
                youtubeLink: 'https://www.youtube.com/watch?v=wbGKfAPlZVA',
                description: 'Build complex research workflows using chained prompting strategies'
            },
            {
                name: 'Creative prompting (ads, stories, scripts)',
                duration: '30 min',
                youtubeLink: 'https://www.youtube.com/watch?v=ZQvfHl-7X48',
                description: 'Unlock AI creativity for marketing content, storytelling, and scriptwriting'
            }
        ]
    },
    'ai-students': {
        title: 'AI for Students',
        goal: 'Productivity boost using AI without coding - perfect for academic success',
        modules: [
            {
                name: 'AI study buddy (explain concepts, quiz creation)',
                duration: '26 min',
                youtubeLink: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
                description: 'Transform your learning with AI tutors and automated quiz generation'
            },
            {
                name: 'Resume & cover letter creation',
                duration: '20 min',
                youtubeLink: 'https://www.youtube.com/watch?v=f9_BWhvxCv0',
                description: 'Craft compelling resumes and cover letters using AI writing assistance'
            },
            {
                name: 'Presentation slide generator (Gamma, Tome AI)',
                duration: '24 min',
                youtubeLink: 'https://www.youtube.com/watch?v=yoXgFx4F3rM',
                description: 'Create professional presentations instantly with AI-powered slide generators'
            },
            {
                name: 'AI scheduling & focus hacks (Motion, Reclaim AI)',
                duration: '18 min',
                youtubeLink: 'https://www.youtube.com/watch?v=aYuoEHOC1kM',
                description: 'Optimize your time and focus using AI-powered scheduling and productivity tools'
            }
        ]
    }
};

// Google Sheets Backend Functions
async function sendToGoogleSheets(action, data) {
    if (GOOGLE_SHEETS_CONFIG.DEMO_MODE) {
        // Demo mode - simulate API responses
        return simulateGoogleSheetsResponse(action, data);
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_CONFIG.WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                data: data
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error communicating with Google Sheets:', error);
        throw error;
    }
}

function simulateGoogleSheetsResponse(action, data) {
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            switch (action) {
                case 'signup':
                    resolve({
                        success: true,
                        message: 'User registered successfully',
                        userId: 'user_' + Date.now()
                    });
                    break;
                case 'login':
                    if (data.email === 'demo@bytesizecourses.com' && data.password === 'demo123') {
                        resolve({
                            success: true,
                            message: 'Login successful',
                            user: {
                                id: 'user_demo',
                                name: 'Demo User',
                                email: 'demo@bytesizecourses.com',
                                plan: null
                            }
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'Invalid credentials. Try demo@bytesizecourses.com / demo123'
                        });
                    }
                    break;
                case 'updatePlan':
                    resolve({
                        success: true,
                        message: 'Plan updated successfully'
                    });
                    break;
                default:
                    resolve({
                        success: false,
                        message: 'Unknown action'
                    });
            }
        }, 1500);
    });
}

// Tab switching
function switchTab(tab) {
    const signupTab = document.getElementById('signup-tab');
    const loginTab = document.getElementById('login-tab');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if (tab === 'signup') {
        signupTab.className = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-200 bg-white text-purple-600 shadow-sm';
        loginTab.className = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-200 text-gray-600 hover:text-gray-900';
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    } else {
        loginTab.className = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-200 bg-white text-purple-600 shadow-sm';
        signupTab.className = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-200 text-gray-600 hover:text-gray-900';
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    }
}

// Page navigation
function showPage(pageId) {
    const pages = ['landing-page', 'courses-page', 'plans-page'];
    pages.forEach(page => {
        document.getElementById(page).classList.add('hidden');
    });
    document.getElementById(pageId + '-page').classList.remove('hidden');
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('signup-btn-text');
    const loading = document.getElementById('signup-loading');
    
    // Show loading
    submitBtn.textContent = 'Creating Account...';
    loading.style.display = 'inline-block';
    
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('fullname'),
        email: formData.get('email'),
        password: formData.get('password'),
        signupDate: new Date().toISOString()
    };

    try {
        const response = await sendToGoogleSheets('signup', userData);
        
        if (response.success) {
            currentUser = {
                id: response.userId,
                name: userData.name,
                email: userData.email,
                plan: null
            };
            
            updateNavigation();
            showPage('courses');
            alert(`🎉 Welcome to Bytesize Courses, ${userData.name}! Your account has been created successfully. Start exploring our courses!`);
        } else {
            alert('Signup failed: ' + response.message);
        }
    } catch (error) {
        alert('Signup failed. Please try again.');
    } finally {
        // Hide loading
        submitBtn.textContent = 'Create Account';
        loading.style.display = 'none';
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('login-btn-text');
    const loading = document.getElementById('login-loading');
    
    // Show loading
    submitBtn.textContent = 'Signing In...';
    loading.style.display = 'inline-block';
    
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await sendToGoogleSheets('login', loginData);
        
        if (response.success) {
            currentUser = response.user;
            userPlan = response.user.plan;
            
            updateNavigation();
            showPage('courses');
            alert(`🎉 Welcome back, ${response.user.name}!`);
        } else {
            alert('Login failed: ' + response.message);
        }
    } catch (error) {
        alert('Login failed. Please try again.');
    } finally {
        // Hide loading
        submitBtn.textContent = 'Sign In';
        loading.style.display = 'none';
    }
}

// Logout
function logout() {
    currentUser = null;
    userPlan = null;
    updateNavigation();
    showPage('landing');
    alert('You have been logged out successfully. Thank you for learning with us!');
}

// Update navigation based on login status
function updateNavigation() {
    const landingNav = document.getElementById('landing-nav');
    const coursesNav = document.getElementById('courses-nav');
    const plansNav = document.getElementById('plans-nav');
    const askAINav = document.getElementById('ask-ai-nav');
    const userWelcome = document.getElementById('user-welcome');
    const logoutBtn = document.getElementById('logout-btn');
    const chatButton = document.getElementById('chat-button');

    if (currentUser) {
        coursesNav.style.display = 'block';
        plansNav.style.display = 'block';
        askAINav.style.display = 'block';
        userWelcome.style.display = 'block';
        userWelcome.textContent = `Welcome, ${currentUser.name}`;
        logoutBtn.style.display = 'block';
        
        if (userPlan === 'premium') {
            chatButton.classList.remove('hidden');
        }
    } else {
        coursesNav.style.display = 'none';
        plansNav.style.display = 'none';
        askAINav.style.display = 'none';
        userWelcome.style.display = 'none';
        logoutBtn.style.display = 'none';
        chatButton.classList.add('hidden');
        document.getElementById('ai-chatbot').classList.add('hidden');
    }
}

// Course details
function showCourseDetails(courseId) {
    const course = courseData[courseId];
    if (!course) return;

    document.getElementById('course-title').textContent = course.title;
    
    const content = document.getElementById('course-content');
    content.innerHTML = `
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-8 border border-purple-200">
            <h4 class="font-bold text-xl mb-3 flex items-center">
                <span class="text-2xl mr-2">🎯</span> Course Goal
            </h4>
            <p class="text-gray-700 text-lg">${course.goal}</p>
        </div>
        
        <div>
            <h4 class="font-bold text-2xl mb-6 flex items-center">
                <span class="text-2xl mr-2">📚</span> Course Modules
            </h4>
            <div class="space-y-6">
                ${course.modules.map((module, index) => `
                    <div class="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-200">
                        <div class="flex justify-between items-start mb-4">
                            <h5 class="font-semibold text-lg text-gray-900 flex-1 pr-4">
                                <span class="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">Module ${index + 1}:</span> ${module.name}
                            </h5>
                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                                ${module.duration}
                            </span>
                        </div>
                        <p class="text-gray-600 mb-4">${module.description}</p>
                        <a href="${module.youtubeLink}" target="_blank" class="inline-flex items-center text-red-600 hover:text-red-700 font-medium transition duration-200">
                            <span class="mr-2 text-lg">▶️</span> Watch Reference Video on YouTube
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="bg-yellow-50 p-6 rounded-xl mt-8 border border-yellow-200">
            <div class="flex items-start">
                <span class="text-2xl mr-3">💡</span>
                <div>
                    <h5 class="font-semibold text-gray-900 mb-2">Important Note</h5>
                    <p class="text-gray-700">
                        These YouTube links are for reference and additional learning. Our full course includes structured lessons, 
                        practical exercises, downloadable resources, quizzes, and certificates of completion available with our premium plans.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('course-modal').classList.remove('hidden');
}

function closeCourseDetails() {
    document.getElementById('course-modal').classList.add('hidden');
}

// Course preview functionality
function startCoursePreview(courseId) {
    const course = courseData[courseId];
    if (!course) return;

    document.getElementById('preview-title').textContent = course.title + ' - Free Preview';
    document.getElementById('course-preview-modal').classList.remove('hidden');
}

function closeCoursePreview() {
    document.getElementById('course-preview-modal').classList.add('hidden');
}

function upgradeFromPreview() {
    closeCoursePreview();
    showPage('plans');
}

// Enroll now functionality
function enrollNow() {
    closeCourseDetails();
    showPage('plans');
}

// Free video functionality
function playFreeVideo(videoType) {
    const videoTitles = {
        'canva': 'Canva AI Basics - Free Preview',
        'chatgpt': 'ChatGPT Mastery - Free Preview',
        'marketing': 'Digital Marketing 101 - Free Preview',
        'excel': 'Excel Essentials - Free Preview',
        'python': 'Python Programming - Free Preview'
    };
    
    const videoDurations = {
        'canva': '12 minutes of professional design techniques',
        'chatgpt': '15 minutes of AI prompting strategies',
        'marketing': '14 minutes of growth marketing tactics',
        'excel': '13 minutes of advanced Excel functions',
        'python': '10 minutes of coding fundamentals'
    };
    
    document.getElementById('video-title').textContent = videoTitles[videoType];
    document.getElementById('video-duration').textContent = videoDurations[videoType];
    document.getElementById('video-modal').classList.remove('hidden');
}

function closeVideo() {
    document.getElementById('video-modal').classList.add('hidden');
}

// Plan selection
async function selectPlan(plan) {
    if (!currentUser) {
        alert('Please sign up or login first to select a plan.');
        showPage('landing');
        return;
    }

    const btnText = document.getElementById(plan + '-btn-text');
    const loading = document.getElementById(plan + '-loading');
    
    // Show loading
    btnText.textContent = 'Processing...';
    loading.style.display = 'inline-block';

    try {
        const response = await sendToGoogleSheets('updatePlan', {
            userId: currentUser.id,
            plan: plan,
            updateDate: new Date().toISOString()
        });

        if (response.success) {
            userPlan = plan;
            currentUser.plan = plan;
            updateNavigation();
            
            if (plan === 'premium') {
                alert('🎉 Welcome to Premium! You now have access to ALL courses and the AI chatbot for instant doubt resolution. Start learning immediately!');
            } else {
                alert('✅ Basic plan activated! You can now access 3 courses of your choice. Choose wisely and start your learning journey!');
            }
        } else {
            alert('Plan selection failed: ' + response.message);
        }
    } catch (error) {
        alert('Plan selection failed. Please try again.');
    } finally {
        // Hide loading
        btnText.textContent = plan === 'premium' ? 'Choose Premium Plan' : 'Choose Basic Plan';
        loading.style.display = 'none';
    }
}

// AI Chatbot functionality
function toggleChatbot() {
    const chatbot = document.getElementById('ai-chatbot');
    const chatButton = document.getElementById('chat-button');
    
    if (isChatbotOpen) {
        chatbot.classList.add('hidden');
        chatButton.classList.remove('hidden');
        isChatbotOpen = false;
    } else {
        chatbot.classList.remove('hidden');
        chatButton.classList.add('hidden');
        isChatbotOpen = true;
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    setTimeout(() => {
        const responses = [
            "Great question! For AI beginners, I'd recommend starting with our ChatGPT basics to understand prompt engineering fundamentals. The key is to be specific and provide context in your prompts.",
            "That's covered in our courses! For trading applications, our AI in Trading course covers market analysis, backtesting, and risk management with AI tools. Would you like specific recommendations?",
            "Canva AI features are incredibly powerful! Our Canva AI Mastery course teaches Magic Design, Magic Write, and AI background tools. You can create professional designs in under 30 minutes!",
            "For students and professionals, our dedicated course covers AI study buddies, resume creation, and presentation generators. These tools can save you hours of work daily!",
            "Python and Excel integration with AI is covered in our advanced modules. I can help you understand how to automate data analysis and create intelligent spreadsheets.",
            "Prompt engineering is crucial for getting the best AI outputs. Our bootcamp covers basic prompts, role-based prompting, chain prompts, and creative applications. What specific area interests you?",
            "I can help you with any course-related questions, assignments, or concepts. What specific AI tool or learning topic would you like to explore further?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, 'ai');
    }, 1500);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-bubble ${sender === 'user' ? 'bg-purple-100 ml-8' : 'bg-gray-100 mr-8'} p-4 rounded-xl`;
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `<div class="flex items-start"><span class="text-xl mr-3">🤖</span><p class="text-sm leading-relaxed">${message}</p></div>`;
    } else {
        messageDiv.innerHTML = `<p class="text-sm text-right leading-relaxed">${message}</p>`;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Ask AI Modal Functions
function openAskAI() {
    document.getElementById('ask-ai-modal').classList.remove('hidden');
}

function closeAskAI() {
    document.getElementById('ask-ai-modal').classList.add('hidden');
}

function askQuickQuestion(question) {
    document.getElementById('ask-ai-input').value = question;
    sendAskAIMessage();
}

function handleAskAIKeypress(event) {
    if (event.key === 'Enter') {
        sendAskAIMessage();
    }
}

async function sendAskAIMessage() {
    const input = document.getElementById('ask-ai-input');
    const message = input.value.trim();
    const sendText = document.getElementById('ask-ai-send-text');
    const loading = document.getElementById('ask-ai-loading');
    
    if (!message) return;
    
    // Show loading
    sendText.textContent = 'Thinking...';
    loading.style.display = 'inline-block';
    
    addAskAIMessage(message, 'user');
    input.value = '';
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiResponse = generateAIResponse(message);
    addAskAIMessage(aiResponse, 'ai');
    
    // Hide loading
    sendText.textContent = 'Send';
    loading.style.display = 'none';
}

function addAskAIMessage(message, sender) {
    const messagesContainer = document.getElementById('ask-ai-messages');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
        messageDiv.className = 'bg-purple-100 p-4 rounded-xl ml-8 border-l-4 border-purple-500';
        messageDiv.innerHTML = `
            <div class="flex items-start justify-end">
                <div class="text-right">
                    <p class="text-sm text-purple-800 font-medium mb-1">You</p>
                    <p class="text-sm text-purple-700">${message}</p>
                </div>
                <span class="text-xl ml-3">👤</span>
            </div>
        `;
    } else {
        messageDiv.className = 'bg-blue-100 p-4 rounded-xl mr-8 border-l-4 border-blue-500';
        messageDiv.innerHTML = `
            <div class="flex items-start">
                <span class="text-xl mr-3">🤖</span>
                <div>
                    <p class="text-sm text-blue-800 font-medium mb-1">AI Assistant</p>
                    <p class="text-sm text-blue-700 leading-relaxed">${message}</p>
                </div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(question) {
    const responses = {
        'chatgpt': [
            "Great question about ChatGPT! Here's how to get started:<br><br>1. <strong>Sign up</strong> at chat.openai.com<br>2. <strong>Start simple</strong>: Ask clear, specific questions<br>3. <strong>Be descriptive</strong>: Provide context for better answers<br>4. <strong>Iterate</strong>: Refine your prompts based on responses<br><br>Example: Instead of 'Write an email', try 'Write a professional follow-up email to a client about project timeline, keeping a friendly but urgent tone.'<br><br>Our ChatGPT course covers advanced prompting techniques that can save you hours daily!",
            "ChatGPT is incredibly powerful when you know how to use it properly! The key is in your prompts - be specific, provide context, and don't hesitate to ask follow-up questions. Our AI for Beginners course has a dedicated module on ChatGPT mastery that covers writing, brainstorming, and summarization techniques."
        ],
        'ai tools': [
            "Excellent question! Here are the best AI tools for beginners:<br><br><strong>🤖 ChatGPT</strong> - Writing, brainstorming, problem-solving<br><strong>🔍 Perplexity AI</strong> - Research and fact-checking<br><strong>📝 Notion AI</strong> - Task management and note-taking<br><strong>🎨 Canva AI</strong> - Design and visual content<br><strong>📊 Otter.ai</strong> - Meeting transcription<br><strong>✍️ Grammarly</strong> - Writing improvement<br><br>Start with ChatGPT and Canva AI - they're user-friendly and immediately useful. Our courses cover all these tools with practical, hands-on examples!",
            "For beginners, I recommend starting with ChatGPT for general tasks, Canva AI for design work, and Perplexity AI for research. These three tools alone can save you 1-2 hours daily once you master them. Our AI for Beginners course walks you through each tool step-by-step!"
        ],
        'studies': [
            "AI can revolutionize your studies! Here's how:<br><br><strong>📚 Study Buddy</strong>: Use ChatGPT to explain complex concepts in simple terms<br><strong>📝 Note Taking</strong>: Otter.ai for lecture transcription, Notion AI for organization<br><strong>🧠 Quiz Creation</strong>: Generate practice questions from your study material<br><strong>📊 Research</strong>: Perplexity AI for accurate, cited information<br><strong>✍️ Writing</strong>: Grammar checking, essay structure, citation help<br><strong>🎯 Focus</strong>: AI scheduling tools like Motion for study planning<br><br>Our 'AI for Students & Professionals' course covers all these applications with practical examples!",
            "AI can be your personal tutor! Use it to explain difficult concepts, create study schedules, generate practice questions, and even help with research. The key is knowing which tool to use for what purpose. Our dedicated course for students covers everything from AI study buddies to presentation creation."
        ],
        'prompt engineering': [
            "Prompt engineering is the art of communicating effectively with AI! Here are the basics:<br><br><strong>🎯 Be Specific</strong>: Instead of 'help me write', say 'write a 200-word professional email to decline a meeting'<br><strong>🎭 Use Roles</strong>: 'Act as a marketing expert and suggest...'<br><strong>📋 Provide Context</strong>: Give background information<br><strong>🔗 Chain Prompts</strong>: Break complex tasks into steps<br><strong>📝 Use Examples</strong>: Show the AI what you want<br><br>Example: 'Act as a financial advisor. Explain compound interest to a 25-year-old beginner in simple terms with a practical example.'<br><br>Our Prompt Engineering Bootcamp covers advanced techniques that can 10x your AI productivity!",
            "Prompt engineering is crucial for getting the best AI outputs! The key principles are: be specific, provide context, use examples, and iterate. Think of it as giving clear instructions to a very capable assistant. Our bootcamp course covers everything from basic prompts to advanced chaining techniques."
        ],
        'default': [
            "That's a great question! Based on your query, I'd recommend checking out our relevant courses for detailed guidance. Here are some quick tips:<br><br>• Be specific about what you want to achieve<br>• Start with one AI tool and master it before moving to others<br>• Practice regularly - AI skills improve with use<br>• Join our courses for structured learning and practical examples<br><br>Is there a specific AI tool or application you'd like to know more about?",
            "I'd be happy to help! For detailed guidance on this topic, I recommend exploring our comprehensive courses. Each course includes practical examples, step-by-step tutorials, and real-world applications. What specific aspect would you like me to elaborate on?",
            "Great question! This is exactly the kind of topic we cover in depth in our courses. For immediate help: try to be as specific as possible about your goal, and don't hesitate to experiment with different approaches. Which of our courses interests you most for this topic?",
            "Excellent question! AI learning is all about practice and the right guidance. Our courses are designed to give you practical, immediately applicable skills. Based on your question, I think you'd benefit from our structured approach to learning these concepts. Would you like me to recommend a specific course?",
            "That's a fantastic question that shows you're thinking strategically about AI! The key is to start with practical applications that solve real problems in your daily life or work. Our courses focus on exactly this - practical AI skills you can use immediately. What's your main goal with AI learning?"
        ]
    };

    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('chatgpt') || lowerQuestion.includes('gpt')) {
        return responses.chatgpt[Math.floor(Math.random() * responses.chatgpt.length)];
    } else if (lowerQuestion.includes('ai tool') || lowerQuestion.includes('beginner') || lowerQuestion.includes('start')) {
        return responses['ai tools'][Math.floor(Math.random() * responses['ai tools'].length)];
    } else if (lowerQuestion.includes('stud') || lowerQuestion.includes('learn') || lowerQuestion.includes('school') || lowerQuestion.includes('college')) {
        return responses.studies[Math.floor(Math.random() * responses.studies.length)];
    } else if (lowerQuestion.includes('prompt') || lowerQuestion.includes('engineering') || lowerQuestion.includes('talk to ai')) {
        return responses['prompt engineering'][Math.floor(Math.random() * responses['prompt engineering'].length)];
    } else {
        return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
}

// Close modals when clicking outside
document.getElementById('course-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCourseDetails();
    }
});

document.getElementById('course-preview-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCoursePreview();
    }
});

document.getElementById('video-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeVideo();
    }
});

document.getElementById('ask-ai-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAskAI();
    }
});

// Initialize
showPage('landing');
updateNavigation();

// Demo instructions
console.log('🚀 Bytesize Courses Demo Instructions:');
console.log('📧 Demo Login: demo@bytesizecourses.com');
console.log('🔑 Demo Password: demo123');
console.log('💡 To connect to Google Sheets, update GOOGLE_SHEETS_CONFIG.WEB_APP_URL with your Google Apps Script URL');