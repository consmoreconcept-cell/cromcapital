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
     PITCH FORM
     -------------------------------------------------------- */
  const pitchForm = document.getElementById('pitchForm');
  const formSuccess = document.getElementById('formSuccess');

  pitchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simple validation
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

    // Show success
    pitchForm.style.display = 'none';
    formSuccess.classList.add('show');
  });

  /* --------------------------------------------------------
     CHATBOT - Virtual Assistant
     -------------------------------------------------------- */
  const chatbotFab = document.getElementById('chatbotFab');
  const chatbot = document.getElementById('chatbot');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const quickRepliesContainer = document.getElementById('quickReplies');

  let chatOpen = false;
  let chatInitialized = false;

  // Knowledge base for the chatbot
  const knowledge = {
    greeting: "Welcome to Crom Capital. I'm here to help you learn about our firm, our investment process, and how to submit a pitch. What would you like to know?",
    investment: "We invest a minimum of $250,000 USD in early-stage startups. Our typical investment range goes from $250K to $3M+, with the ability to follow on in subsequent funding rounds.",
    speed: "Speed is our hallmark. Once due diligence is complete, we deploy capital within 48 hours. We believe momentum is critical for early-stage companies, and funding delays can kill a startup's trajectory.",
    ownership: "We take a 10-15% ownership stake in the companies we invest in. This reflects our commitment to being true partners, not passive investors. We earn our equity through hands-on operational support, strategic guidance, and network access.",
    sectors: "We invest across multiple sectors including SaaS/Software, Healthcare & Biotech, Fintech, Consumer, Deep Tech & AI, and Clean Tech. We welcome startups from any geography, so if you are building something great, we want to hear from you.",
    location: "Our headquarters are in Seattle, Washington, at 1201 Third Avenue, Suite 4200, Seattle, WA 98101. While we are based in Seattle, our investments are not limited to any specific region.",
    partners: "Crom Capital is led by three managing partners: James Rourke (Managing Partner, 15+ years in VC), Elena Harding (Partner, Operations, serial entrepreneur), and Marcus Kim (Partner, Technology, former CTO and deep tech investor).",
    process: "Our process has four stages: 1) Submit your pitch via our online form. 2) We evaluate and schedule a deep-dive if there's a fit. 3) We conduct efficient due diligence on market, team, tech, and financials. 4) Term sheet and capital deployed within 48 hours of completed diligence.",
    pitch: "You can submit your pitch by scrolling down to our 'Submit Your Pitch' section or clicking the 'Submit a Pitch' button in the navigation. You'll need to provide your company details, sector, stage, and a brief description of your business.",
    contact: "You can reach us by email at hello@cromcapital.com, submit a pitch through our website, or visit our office at 1201 Third Avenue, Suite 4200, Seattle, WA 98101.",
    portfolio: "We have invested in 72 portfolio companies with over $45M in total capital deployed. Our portfolio spans technology, healthcare, consumer, and deep tech sectors.",
    diligence: "Our due diligence process is thorough but efficient. We evaluate market opportunity, team strength, technology differentiation, financials, and competitive landscape. We respect your time and aim to complete diligence quickly.",
    support: "Beyond capital, we provide hands-on operational support. This includes go-to-market strategy, talent acquisition, board-level guidance, customer introductions through our network, and strategic planning.",
    fallback: "I can help you with information about our investment approach, funding process, ownership terms, team, and how to submit a pitch. Could you try rephrasing your question, or pick one of the quick options below?"
  };

  // Intent matching
  function matchIntent(message) {
    const msg = message.toLowerCase().trim();

    if (/^(hi|hello|hey|good\s?(morning|afternoon|evening)|greetings)/i.test(msg)) return 'greeting';
    if (/invest(ment)?|how much|minimum|fund(ing)?|capital|money|amount|raise|round/i.test(msg)) return 'investment';
    if (/48|speed|fast|quick|how long|timeline|when|turnaround|deploy/i.test(msg)) return 'speed';
    if (/owner(ship)?|stake|equity|percent|%|10|15|share/i.test(msg)) return 'ownership';
    if (/sector|industry|focus|area|type|what.*(invest|fund)|saas|health|fintech|ai|tech|clean/i.test(msg)) return 'sectors';
    if (/where|locat|address|office|seattle|city|based/i.test(msg)) return 'location';
    if (/partner|team|who|founder|lead|manage|james|elena|marcus/i.test(msg)) return 'partners';
    if (/process|how.*(work|apply|start)|step|stage/i.test(msg)) return 'process';
    if (/pitch|submit|apply|send|form|proposal/i.test(msg)) return 'pitch';
    if (/contact|reach|email|phone|call|meet/i.test(msg)) return 'contact';
    if (/portfolio|companies|invest(ed|ment)|track|record|number/i.test(msg)) return 'portfolio';
    if (/diligence|dd|review|evaluat/i.test(msg)) return 'diligence';
    if (/support|help|beyond|operational|mentor|guid/i.test(msg)) return 'support';

    return 'fallback';
  }

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `chatbot__message chatbot__message--${type}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
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

    // Simulate thinking delay
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      removeTypingIndicator();
      const intent = matchIntent(message);
      addMessage(knowledge[intent], 'bot');

      // Show contextual quick replies
      const contextReplies = getContextualReplies(intent);
      if (contextReplies.length > 0) {
        setTimeout(() => showQuickReplies(contextReplies), 300);
      }
    }, delay);
  }

  function getContextualReplies(lastIntent) {
    const replyMap = {
      greeting: ['Investment details', 'How fast is funding?', 'How to submit a pitch'],
      investment: ['Ownership terms', 'What sectors?', 'Submit a pitch'],
      speed: ['Investment amount', 'Full process', 'Submit a pitch'],
      ownership: ['Investment amount', '48-hour funding', 'Meet the partners'],
      sectors: ['Investment amount', 'Our process', 'Submit a pitch'],
      location: ['Contact info', 'Meet the partners', 'Our process'],
      partners: ['Our process', 'Sectors we fund', 'Submit a pitch'],
      process: ['48-hour funding', 'Ownership terms', 'Submit a pitch'],
      pitch: ['Investment details', 'Our process', 'Contact us'],
      contact: ['Our office location', 'Submit a pitch', 'Our process'],
      portfolio: ['Investment details', 'Our process', 'Meet the partners'],
      diligence: ['48-hour funding', 'Our full process', 'Submit a pitch'],
      support: ['Investment details', 'Meet the partners', 'Submit a pitch'],
      fallback: ['Investment details', 'Our process', 'How to pitch']
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
      // Welcome message with slight delay
      setTimeout(() => {
        addMessage(knowledge.greeting, 'bot');
        setTimeout(() => {
          showQuickReplies(['Investment details', 'How fast is funding?', 'How to submit a pitch', 'Meet the team']);
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
     (For browsers without animation-timeline support)
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
