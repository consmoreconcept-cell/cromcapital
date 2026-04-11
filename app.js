/* ============================================================
   CROM CAPITAL - App Logic
   ============================================================ */

(function () {
  'use strict';

  // Initialize Lucide icons
  lucide.createIcons();

  /* --------------------------------------------------------
     HEADER: Hide on scroll down, show on scroll up
     -------------------------------------------------------- */
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 80) {
      header.style.background = 'rgba(10, 10, 10, 0.95)';
      if (currentScroll > lastScroll && currentScroll > 400) {
        header.classList.add('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }
    } else {
      header.style.background = 'rgba(10, 10, 10, 0.85)';
      header.classList.remove('header--hidden');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  /* --------------------------------------------------------
     MOBILE NAV
     -------------------------------------------------------- */
  const hamburger = document.querySelector('.header__hamburger');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile nav on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  /* --------------------------------------------------------
     SMOOTH SCROLL for nav links
     -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --------------------------------------------------------
     PITCH FORM - Submit to Google Sheets + Email
     -------------------------------------------------------- */
  const SHEET_ID = '1t3B5hiKtYGp72D81NVDqahhYUc_H_L9D7yMAqwZzA1U';
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyga6WlxgKMRPA7_iB_349aH7DwWrRRKoZWpUlutJP-RK7S-BSRhmzs4pwAbmxNCCzq/exec';

  const pitchForm = document.getElementById('pitchForm');
  const formSuccess = document.getElementById('formSuccess');

  pitchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validation
    const inputs = pitchForm.querySelectorAll('[required]');
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderColor = 'var(--color-error)';
        input.addEventListener('input', () => {
          input.style.borderColor = '';
        }, { once: true });
      }
    });
    if (!valid) return;

    // Collect form data
    const data = {
      timestamp: new Date().toISOString(),
      name: pitchForm.founderName.value.trim(),
      email: pitchForm.email.value.trim(),
      phone: pitchForm.phone.value.trim(),
      company: pitchForm.companyName.value.trim(),
      website: pitchForm.website.value.trim(),
      contactMethod: pitchForm.contactMethod.value,
      sector: pitchForm.sector.value,
      stage: pitchForm.stage.value,
      raise: pitchForm.raise.value,
      capitalization: pitchForm.capitalization.value,
      pitch: pitchForm.pitch.value.trim(),
      sheetId: SHEET_ID
    };

    // Show success immediately for UX
    pitchForm.style.display = 'none';
    formSuccess.classList.add('show');

    // Submit via hidden form POST to iframe
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'pitchSubmitFrame_' + Date.now();
      document.body.appendChild(iframe);

      const hiddenForm = document.createElement('form');
      hiddenForm.method = 'POST';
      hiddenForm.action = FORM_ENDPOINT;
      hiddenForm.target = iframe.name;
      hiddenForm.style.display = 'none';

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        hiddenForm.appendChild(input);
      });

      document.body.appendChild(hiddenForm);
      hiddenForm.submit();
      setTimeout(() => { hiddenForm.remove(); iframe.remove(); }, 15000);
    } catch (err) {
      // Silent fail - form already shows success
    }
  });

  /* --------------------------------------------------------
     RACHEL HILL - Virtual Assistant
     -------------------------------------------------------- */
  const chatbotFab = document.getElementById('chatbotFab');
  const chatbot = document.getElementById('chatbot');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const quickRepliesContainer = document.getElementById('quickReplies');

  let chatOpen = false;
  let chatInitialized = false;

  // Rachel Hill knowledge base
  const knowledge = {
    greeting: "Hi there! I'm Rachel Hill, your guide to everything Crom Capital. Whether you're a founder exploring funding options or just curious about how we work, I'm happy to help. What's on your mind?",

    investment: "Great question! At Crom Capital, we write checks starting at $250,000 USD, with no upper hard limit. Our typical deals range from $250K up to $3M and beyond, and we're always open to following on in later rounds if the company is thriving. We're looking for founders who are serious about building something that lasts.",

    speed: "This is one of my favorite things about Crom Capital! Once your due diligence is wrapped up, we move fast. Capital is deployed within 48 hours of completion. No waiting around for endless board meetings or bureaucratic sign-offs. We know how much momentum matters early on, and we refuse to be the bottleneck.",

    ownership: "We take a 10 to 15 percent ownership stake in every company we back. I know that might sound like a lot at first glance, but here is the thing: we genuinely earn it. Our partners roll up their sleeves and work alongside you on strategy, operations, hiring, and growth. When you win, we win. It is as simple as that.",

    sectors: "We invest across a pretty broad range of sectors! That includes SaaS and software, healthcare and biotech, fintech, consumer brands, deep tech and AI, and clean tech. We are sector-agnostic at heart. If you are building something with real potential, we want to hear about it regardless of your industry.",

    location: "Crom Capital is headquartered right in the heart of Seattle, at 1201 Third Avenue, Suite 4200, Seattle, WA 98101. That said, our investments are absolutely not limited to Seattle or any specific region. We back great founders wherever they are building.",

    partners: "Crom Capital is led by three incredible partners. James Rourke is our Managing Partner with over 15 years in venture capital and more than $200M deployed. Elena Harding leads Operations, she is a serial entrepreneur who built and exited two SaaS companies. And Marcus Kim heads Technology, bringing deep tech due diligence expertise and a vast network of engineering leaders. Together they bring decades of real operator experience.",

    process: "The process is designed to be as smooth as possible for founders. First, you submit your pitch through our online form. We review every submission and get back to you within 72 hours. If there is a fit, we schedule a deep-dive session with our partners. From there, we run efficient due diligence covering your market, team, technology, and financials. Once diligence is complete, the term sheet and capital follow within 48 hours. That is it!",

    pitch: "Submitting a pitch is easy! Just scroll down to the 'Submit Your Pitch' section on this page, or click the 'Submit a Pitch' button in the navigation menu. You will fill in some details about your company, your funding stage, how much you are raising, your current capitalization, and a short description of what you are building. We read every single one.",

    contact: "You can always reach the team by email at hello@cromcapital.com. You can also submit a pitch directly through the website, or if you prefer a face-to-face conversation, come visit us at 1201 Third Avenue, Suite 4200, Seattle, WA 98101. We love meeting founders in person!",

    portfolio: "We are proud to have backed 72 portfolio companies to date, with over $45 million in total capital deployed. Our portfolio spans technology, healthcare, consumer, and deep tech. Each one represents a founding team we genuinely believe in.",

    diligence: "Due diligence at Crom Capital is thorough but never slow. We look at four key areas: market opportunity, team strength, technology differentiation, and financial health. We are respectful of your time and focus on what actually matters for your stage. The whole process is designed to move quickly so we can get to a decision fast.",

    support: "Capital is just the beginning! Our partners are hands-on operators who stay close to the companies they back. That means help with go-to-market strategy, building your leadership team, customer introductions through our network, board-level guidance, and long-term strategic planning. We are in your corner for the long haul.",

    mission: "Crom Capital was founded on a simple belief: the next great companies can be built anywhere, by anyone with the vision and drive to make it happen. Our job is to give founders the capital, the support, and the belief they need to turn that vision into something real.",

    minimum: "Our minimum investment is $250,000 USD. There is no defined ceiling. We size our checks based on the opportunity and what the company actually needs to hit its next milestone.",

    timeline: "From pitch submission to our first response, you can expect to hear from us within 72 hours. If things move forward, diligence is typically completed within a couple of weeks. From signed term sheet to capital in your account, it is 48 hours. We move fast because we respect your time.",

    equity: "We structure our investments as equity ownership, typically 10 to 15 percent. This is negotiated based on valuation and the size of the investment. We prefer clean, straightforward terms so everyone knows exactly where they stand.",

    rachel: "Ha, glad you asked! I am Rachel Hill, Crom Capital's virtual assistant. I am here to answer your questions about the firm, our investment process, our partners, and anything else you want to know. Think of me as your first point of contact before you meet the team. What can I help you with?",

    fallback: "Hmm, I want to make sure I give you the right answer! I can help with details on our investment process, funding timelines, ownership terms, the partner team, how to submit a pitch, and pretty much anything else about Crom Capital. Try asking me something specific, or pick one of the options below!"
  };

  // Intent matching
  function matchIntent(message) {
    const msg = message.toLowerCase().trim();

    if (/^(hi|hello|hey|good\s?(morning|afternoon|evening)|greetings|howdy|what.?s up)/i.test(msg)) return 'greeting';
    if (/rachel|who are you|your name|assistant|bot/i.test(msg)) return 'rachel';
    if (/mission|vision|believe|founded|why|purpose|story/i.test(msg)) return 'mission';
    if (/minimum|how much|invest(ment)?|fund(ing)?|capital|money|amount|raise|round|check size/i.test(msg)) return 'investment';
    if (/48|speed|fast|quick|how long|timeline|when|turnaround|deploy|time to fund/i.test(msg)) return 'speed';
    if (/timeline|how soon|days|weeks|response|hear back/i.test(msg)) return 'timeline';
    if (/owner(ship)?|stake|equity|percent|%|share|dilut/i.test(msg)) return 'ownership';
    if (/equity|structure|term|terms/i.test(msg)) return 'equity';
    if (/sector|industry|focus|area|type|what.*(invest|fund)|saas|health|fintech|ai|tech|clean|consumer/i.test(msg)) return 'sectors';
    if (/where|locat|address|office|seattle|city|based|headquarter/i.test(msg)) return 'location';
    if (/partner|team|who|founder|lead|manage|james|elena|marcus|rourke|harding|kim/i.test(msg)) return 'partners';
    if (/process|how.*(work|apply|start)|step|stage|procedure/i.test(msg)) return 'process';
    if (/pitch|submit|apply|send|form|proposal/i.test(msg)) return 'pitch';
    if (/contact|reach|email|phone|call|meet|visit/i.test(msg)) return 'contact';
    if (/portfolio|compan(y|ies)|invest(ed)?|track|record|number|how many/i.test(msg)) return 'portfolio';
    if (/diligence|dd|review|evaluat|check|assess/i.test(msg)) return 'diligence';
    if (/support|help|beyond|operational|mentor|guid|value.add|resource/i.test(msg)) return 'support';
    if (/minimum|floor|least|smallest/i.test(msg)) return 'minimum';

    return 'fallback';
  }

  function addMessage(text, type, hasAction) {
    const msg = document.createElement('div');
    msg.className = `chatbot__message chatbot__message--${type}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);

    if (hasAction === 'pitch') {
      const btnWrap = document.createElement('div');
      btnWrap.style.marginTop = '10px';
      const btn = document.createElement('a');
      btn.href = '#pitch';
      btn.className = 'chatbot__action-btn';
      btn.textContent = 'Submit Your Pitch';
      btn.addEventListener('click', () => {
        chatbotFab.click();
        setTimeout(() => {
          document.getElementById('pitch').scrollIntoView({ behavior: 'smooth' });
        }, 300);
      });
      btnWrap.appendChild(btn);
      msg.appendChild(btnWrap);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'chatbot__message chatbot__message--bot chatbot__message--typing';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typing;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  function showQuickReplies(replies) {
    quickRepliesContainer.innerHTML = '';
    replies.forEach(reply => {
      const btn = document.createElement('button');
      btn.className = 'chatbot__quick-reply';
      btn.textContent = reply;
      btn.addEventListener('click', () => {
        handleUserMessage(reply);
        quickRepliesContainer.innerHTML = '';
      });
      quickRepliesContainer.appendChild(btn);
    });
  }

  function handleUserMessage(message) {
    addMessage(message, 'user');
    chatInput.value = '';

    const typing = addTypingIndicator();

    const delay = 700 + Math.random() * 700;
    setTimeout(() => {
      removeTypingIndicator();
      const intent = matchIntent(message);
      const pitchIntents = ['pitch', 'process', 'investment', 'speed', 'timeline', 'greeting', 'minimum'];
      const showPitchBtn = pitchIntents.includes(intent);
      addMessage(knowledge[intent], 'bot', showPitchBtn ? 'pitch' : null);

      const contextReplies = getContextualReplies(intent);
      if (contextReplies.length > 0) {
        setTimeout(() => showQuickReplies(contextReplies), 300);
      }
    }, delay);
  }

  function getContextualReplies(lastIntent) {
    const replyMap = {
      greeting:   ['How does funding work?', 'Who are the partners?', 'Submit a pitch'],
      rachel:     ['Investment details', 'How does funding work?', 'Submit a pitch'],
      mission:    ['Meet the partners', 'Investment details', 'Submit a pitch'],
      investment: ['Ownership terms', 'What sectors?', 'Submit a pitch'],
      speed:      ['Full process', 'Investment amount', 'Submit a pitch'],
      timeline:   ['48-hour funding', 'Full process', 'Submit a pitch'],
      ownership:  ['Investment amount', 'Equity structure', 'Meet the partners'],
      equity:     ['Investment amount', 'Ownership terms', 'Submit a pitch'],
      sectors:    ['Investment amount', 'Our process', 'Submit a pitch'],
      location:   ['Contact info', 'Meet the partners', 'Submit a pitch'],
      partners:   ['Our process', 'Sectors we fund', 'Submit a pitch'],
      process:    ['48-hour funding', 'Ownership terms', 'Submit a pitch'],
      pitch:      ['Investment details', 'Our process', 'Contact us'],
      contact:    ['Submit a pitch', 'Our process', 'Meet the partners'],
      portfolio:  ['Investment details', 'Our process', 'Meet the partners'],
      diligence:  ['48-hour funding', 'Full process', 'Submit a pitch'],
      support:    ['Investment details', 'Meet the partners', 'Submit a pitch'],
      minimum:    ['Ownership terms', 'Our process', 'Submit a pitch'],
      fallback:   ['Investment details', 'Our process', 'How to pitch']
    };
    return replyMap[lastIntent] || replyMap.fallback;
  }

  // Toggle chatbot
  chatbotFab.addEventListener('click', () => {
    chatOpen = !chatOpen;
    chatbotFab.classList.toggle('open', chatOpen);
    chatbot.classList.toggle('open', chatOpen);
    chatbot.setAttribute('aria-hidden', !chatOpen);

    if (chatOpen && !chatInitialized) {
      chatInitialized = true;
      setTimeout(() => {
        addMessage(knowledge.greeting, 'bot');
        setTimeout(() => {
          showQuickReplies(['How does funding work?', 'Who are the partners?', 'Submit a pitch', 'Ownership terms']);
        }, 400);
      }, 500);
    }

    if (chatOpen) {
      setTimeout(() => chatInput.focus(), 300);
    }
  });

  // Send message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    quickRepliesContainer.innerHTML = '';
    handleUserMessage(message);
  }

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  /* --------------------------------------------------------
     SCROLL REVEAL FALLBACK
     -------------------------------------------------------- */
  if (!CSS.supports('animation-timeline', 'scroll()')) {
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }

})();
