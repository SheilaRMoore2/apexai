// ============================================================
// Apex AI Automation — Custom Chatbot Widget
// Same questions & format as the previous ArtiBot widget.
// Collects lead info step-by-step and submits to Formspree.
// ============================================================
(function () {
    // --- Safe start: don't run twice ---
    if (window.__ApexChatLoaded) return;
    window.__ApexChatLoaded = true;

    // ------- Config -------
    var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzdngdog';

    // ------- State -------
    var lead = {};

    // ------- Inject styles -------
    var style = document.createElement('style');
    style.textContent = [
        '#apex-chat-btn{position:fixed;bottom:24px;right:24px;z-index:9999;background:#2563eb;color:#fff;border:none;border-radius:9999px;padding:16px 22px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:0 10px 25px rgba(0,0,0,.4);transition:background .2s}',
        '#apex-chat-btn:hover{background:#3b82f6}',
        '#apex-chat-btn .apex-dot{width:14px;height:14px;border-radius:50%;background:#22c55e;display:inline-block}',
        '#apex-chat-wrap{position:fixed;bottom:24px;right:24px;z-index:9998;width:370px;max-width:calc(100vw - 32px);display:none;flex-direction:column;height:520px;max-height:calc(100vh - 48px);background:#0a1640;border:1px solid #1e3a8a;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.5)}',
        '#apex-chat-wrap.open{display:flex}',
        '#apex-chat-head{background:#1e3a8a;padding:16px;display:flex;align-items:center;gap:12px}',
        '#apex-chat-head .apex-logo{font-weight:900;font-style:italic;color:#fff}',
        '#apex-chat-head .apex-logo span{color:#60a5fa}',
        '#apex-chat-close{margin-left:auto;background:none;border:none;color:#dbeafe;font-size:22px;cursor:pointer;line-height:1}',
        '#apex-chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}',
        '.apex-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.4;white-space:pre-wrap}',
        '.apex-bot-msg{background:#1e3a8a;color:#dbeafe;align-self:flex-start;border-bottom-left-radius:4px}',
        '.apex-user-msg{background:#2563eb;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}',
        '.apex-options{display:flex;flex-wrap:wrap;gap:8px;align-self:flex-start}',
        '.apex-opt{background:#0b2565;color:#dbeafe;border:1px solid #3b82f6;border-radius:9999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s}',
        '.apex-opt:hover{background:#2563eb;color:#fff}',
        '.apex-input-row{display:flex;gap:8px;align-items:center}',
        '#apex-chat-input{flex:1;background:#0b2565;border:1px solid #3b82f6;color:#fff;border-radius:9999px;padding:10px 16px;font-size:14px;outline:none}',
        '#apex-chat-input::placeholder{color:#93a5cf}',
        '#apex-send{background:#2563eb;border:none;color:#fff;border-radius:9999px;padding:10px 16px;font-weight:700;cursor:pointer}',
        '#apex-send:hover{background:#3b82f6}',
        '@media(max-width:640px){#apex-chat-wrap{width:100%;bottom:0;right:0;left:0;max-width:none;height:100vh;max-height:100vh;border-radius:0}}'
    ].join('');
    document.head.appendChild(style);

    // ------- Inject HTML -------
    var wrap = document.createElement('div');
    wrap.id = 'apex-chat-wrap';
    wrap.innerHTML =
        '<div id="apex-chat-head">' +
            '<span class="apex-logo">APEX<span>AI</span> AUTOMATION</span>' +
            '<button id="apex-chat-close" aria-label="Close chat">&times;</button>' +
        '</div>' +
        '<div id="apex-chat-body"></div>' +
        '<div style="padding:12px;border-top:1px solid #1e3a8a">' +
            '<div class="apex-input-row">' +
                '<input id="apex-chat-input" type="text" placeholder="Type your answer..." />' +
                '<button id="apex-send">Send</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(wrap);

    var btn = document.createElement('button');
    btn.id = 'apex-chat-btn';
    btn.innerHTML = '<span class="apex-dot"></span> Chat with us';
    document.body.appendChild(btn);

    // ------- Element references -------
    var body = document.getElementById('apex-chat-body');
    var input = document.getElementById('apex-chat-input');
    var sendBtn = document.getElementById('apex-send');
    var closeBtn = document.getElementById('apex-chat-close');

    // ------- Question flow definition -------
    var stepIndex = 0;
    var steps = [
{
            question: 'What service sparked your interest?',
            options: ['Chatbot', 'Automation', 'I need a website', 'Custom Web App', 'Advanced AI Agent', 'Full Business Automation'],
            key: 'service',
            freeText: false
        },
        { question: 'What type of business do you own?', key: 'business', freeText: true },
        { question: 'What is your phone number?', key: 'phone', freeText: true },
        { question: 'What is your email address?', key: 'email', freeText: true, type: 'email' },
        { question: 'What is the best way to reach you? (Text, Email, or Phone)', key: 'reach', freeText: true },
        { question: 'What is the best time to reach you?', key: 'time', freeText: true }
    ];

    // ------- Chat helpers -------
    function addBotMsg(text) {
        var m = document.createElement('div');
        m.className = 'apex-msg apex-bot-msg';
        m.textContent = text;
        body.appendChild(m);
        body.scrollTop = body.scrollHeight;
    }
    function addUserMsg(text) {
        var m = document.createElement('div');
        m.className = 'apex-msg apex-user-msg';
        m.textContent = text;
        body.appendChild(m);
        body.scrollTop = body.scrollHeight;
    }
    function addOptions(opts) {
        var c = document.createElement('div');
        c.className = 'apex-options';
        opts.forEach(function (opt) {
            var b = document.createElement('button');
            b.className = 'apex-opt';
            b.textContent = opt;
            b.addEventListener('click', function () { handleAnswer(opt); });
            c.appendChild(b);
        });
        body.appendChild(c);
        body.scrollTop = body.scrollHeight;
    }
    function showInput(show) {
        input.style.display = show ? '' : 'none';
        sendBtn.style.display = show ? '' : 'none';
        if (show) {
            input.value = '';
            input.focus();
        }
    }

    // ------- Answer handling -------
    function handleAnswer(value) {
        var step = steps[stepIndex];
        if (step) {
            lead[step.key] = value;
            addUserMsg(value);
        }
        stepIndex++;
        if (stepIndex < steps.length) {
            askStep(stepIndex);
        } else {
            submitLead();
        }
    }

    function askStep(idx) {
        var step = steps[idx];
        addBotMsg(step.question);
        if (step.options) {
            addOptions(step.options);
            showInput(false);
        } else {
            showInput(true);
        }
    }

    // ------- Submission -------
    function submitLead() {
        showInput(false);
        addBotMsg('Thanks! Here is what we received:\n' +
            '• Service: ' + (lead.service || '-') + '\n' +
            '• Business: ' + (lead.business || '-') + '\n' +
            '• Phone: ' + (lead.phone || '-') + '\n' +
            '• Email: ' + (lead.email || '-') + '\n' +
            '• Preferred contact: ' + (lead.reach || '-') + '\n' +
            '• Best time: ' + (lead.time || '-'));
        addBotMsg('A member of the Apex team will reach out shortly. Thanks!');

        // Send to Formspree
        var payload = {
            subject: 'New Chatbot Lead',
            _subject: 'New Chatbot Lead',
            service: lead.service || '',
            business: lead.business || '',
            phone: lead.phone || '',
            email: lead.email || '',
            preferred_contact: lead.reach || '',
            best_time: lead.time || '',
            message: 'New lead captured from the website chat widget.'
        };
        var form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', FORMSPREE_ENDPOINT);
        form.style.display = 'none';
        for (var k in payload) {
            var inp = document.createElement('input');
            inp.setAttribute('type', 'hidden');
            inp.setAttribute('name', k);
            inp.setAttribute('value', payload[k]);
            form.appendChild(inp);
        }
        document.body.appendChild(form);
        try { form.submit(); } catch (e) { console.log(e); }
    }

    // ------- Restart -------
    function startChat() {
        document.getElementById('apex-chat-wrap').classList.add('open');
        body.innerHTML = '';
        stepIndex = 0;
        lead = {};
        addBotMsg('Hi there! 👋 Welcome to Apex AI Automation.');
        askStep(stepIndex);
    }

    function closeChat() {
        document.getElementById('apex-chat-wrap').classList.remove('open');
    }

    // ------- Event wiring -------
    btn.addEventListener('click', function () {
        var open = document.getElementById('apex-chat-wrap').classList.contains('open');
        if (open) {
            closeChat();
        } else {
            startChat();
        }
    });
    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', function () {
        var val = input.value.trim();
        if (!val) return;
        handleAnswer(val);
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendBtn.click();
        }
    });
})();

