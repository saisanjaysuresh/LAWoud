/* ============================================
   LAWoud — Script
   AI Chatbot for Constitutional Awareness & Legal Aid
   ============================================ */

(function () {
  'use strict';

  // ======================== DOM REFERENCES ========================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const DOM = {
    app: $('#app'),
    sidebar: $('#sidebar'),
    sidebarOverlay: $('#sidebarOverlay'),
    sidebarCollapseBtn: $('#sidebarCollapseBtn'),
    mobileMenuBtn: $('#mobileMenuBtn'),
    newChatSidebar: $('#newChatSidebar'),
    newChatHeader: $('#newChatHeader'),
    navItems: $$('.nav-item'),
    recentChats: $('#recentChats'),

    accountBtn: $('#accountBtn'),
    accountDropdown: $('#accountDropdown'),

    shareBtn: $('#shareBtn'),
    saveChatBtn: $('#saveChatBtn'),

    chatArea: $('#chatArea'),
    welcomeState: $('#welcomeState'),
    welcomeSuggestions: $('#welcomeSuggestions'),
    chatMessages: $('#chatMessages'),
    chatInput: $('#chatInput'),
    sendBtn: $('#sendBtn'),
    attachBtn: $('#attachBtn'),
    micBtn: $('#micBtn'),
    fileInput: $('#fileInput'),
    attachedFile: $('#attachedFile'),
    attachedFileName: $('#attachedFileName'),
    removeFileBtn: $('#removeFileBtn'),

    headerTitle: $('#headerTitle'),
    headerSubtitle: $('#headerSubtitle'),

    modalOverlay: $('#modalOverlay'),
    shareModal: $('#shareModal'),
    shareModalClose: $('#shareModalClose'),
    shareLinkInput: $('#shareLinkInput'),
    shareCopyBtn: $('#shareCopyBtn'),

    legalHelpModal: $('#legalHelpModal'),
    legalHelpModalClose: $('#legalHelpModalClose'),

    chatHistoryModal: $('#chatHistoryModal'),
    chatHistoryModalClose: $('#chatHistoryModalClose'),
    historyList: $('#historyList'),

    toast: $('#toast'),
    toastMessage: $('#toastMessage'),
  };

  // Safe event helper to prevent crashes if element is missing
  function safeAddListener(element, event, handler) {
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  function bindKeyboardClick(element, callback) {
    if (!element) return;
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback(e);
      }
    });
  }

  // ======================== STATE ========================
  const state = {
    currentView: 'welcome', // 'welcome' | 'chat'
    theme: 'dark',
    sidebarOpen: false,
    activeDropdown: null,
    isRecording: false,
    recognition: null,
    attachedFileName: null,
    isGenerating: false,
    conversations: {
      1: {
        title: 'Rights during police search',
        time: '11:30 AM',
        messages: [
          { type: 'user', text: 'What are my rights if the police search my house without a warrant?', time: '11:28 AM' },
          { type: 'ai', text: 'Under Article 21 and Article 22 of the Constitution of India, citizens are protected against arbitrary search and seizure.\n\nGenerally, police officers must obtain a search warrant from a magistrate before entering a private residence, except under urgent statutory exceptions defined in Section 165 CrPC / BNSS.\n\nYou have the right to ask for their identification, request a copy of the search memo, and have independent witnesses present.', time: '11:29 AM', queryType: 'police' }
        ]
      },
      2: {
        title: 'Landlord deposit refund legal notice',
        time: 'Yesterday',
        messages: [
          { type: 'user', text: 'My landlord is refusing to return my security deposit after I vacated the flat. What can I do?', time: '3:45 PM' },
          { type: 'ai', text: 'Landlords cannot arbitrarily withhold security deposits without valid proof of damages.\n\nUnder tenancy laws and Section 106 of the Transfer of Property Act, you can issue a formal legal notice demanding the refund within 15 days.\n\nIf unpaid, you can approach the Rent Control Tribunal or Consumer Protection Forum for compensation.', time: '3:46 PM', queryType: 'landlord' }
        ]
      },
      3: {
        title: 'Online consumer refund complaint',
        time: '2 days ago',
        messages: [
          { type: 'user', text: 'How can I file a complaint online against a company that refused to give me a refund?', time: '2:15 PM' },
          { type: 'ai', text: 'Under the Consumer Protection Act, 2019, refusing legitimate refunds constitutes an unfair trade practice.\n\nYou can file a free complaint with the National Consumer Helpline (NCH) at consumerhelpline.gov.in or call 1915.\n\nFor legal dispute resolution, submit an e-filing via the e-Daakhil portal (edaakhil.nic.in).', time: '2:16 PM', queryType: 'consumer' }
        ]
      }
    },
    currentChatId: null,
    currentMessages: [],
  };

  // ======================== CONSTITUTIONAL & LEGAL KNOWLEDGE ENGINE ========================
  // Comprehensive knowledge database derived from General provisions all.md
  const LEGAL_KNOWLEDGE_BASE = [
    {
      keywords: ['police', 'search', 'warrant', 'arrest', 'detain', 'stop', 'phone', 'seize', 'station', 'custody', 'cop'],
      queryType: 'police',
      title: 'Police & Detention Protections',
      summary: 'Rights regarding police search, phone seizure, detention, and arrest procedures in India.',
      response: `Here is a breakdown of your constitutional rights and legal remedies regarding police interactions:

1. **Right to Know Grounds of Arrest & Search (Article 22(1))**: You must be immediately informed why you are stopped, detained, or searched.
2. **Search Warrants & Statutory Limits (Sec 165 CrPC / BNSS)**: Except in urgent cognizable offences, police cannot search private premises without a written warrant from a Magistrate.
3. **Seizure of Personal Belongings / Phone**: Police cannot arbitrarily seize phones without issuing a formal seizure memo (Panchnama) signed by independent witnesses detailing seized items.
4. **Right to Legal Counsel & Silence (Article 20(3) & 22(1))**: You have the right to consult a lawyer of your choice and cannot be compelled to be a witness against yourself.
5. **Right to inform a relative (Sec 50A CrPC)**: Police are legally bound to inform your family or friend immediately upon detention.`,
      rights: {
        title: 'Your Fundamental Protections',
        content: `
          <div class="simple-explain">
            <div class="label">Article 21 — Right to Life & Personal Liberty</div>
            <p>Guarantees that your personal freedom and property cannot be interfered with except according to strict procedure established by law.</p>
          </div>
          <div class="simple-explain">
            <div class="label">Article 22 — Protection Against Arbitrary Arrest & Seizure</div>
            <p>Protects you from arbitrary detention and mandates that reasons for arrest/seizure must be clearly communicated.</p>
          </div>
          <p><strong>In simple words:</strong> Police must follow statutory rules. Unlawful confiscation without written receipt violates your constitutional rights.</p>
        `,
        actions: ['Explain simply', 'Show source']
      },
      law: {
        title: 'Relevant Statutory Provisions',
        content: `
          <p><strong>Primary Legislation & Articles</strong></p>
          <p>• <strong>Article 21 & 22</strong> — Constitution of India</p>
          <p>• <strong>Section 165 & 100 CrPC / BNSS</strong> — Rules for search and seizure memos</p>
          <p>• <strong>Section 50 & 50A CrPC</strong> — Mandatory communication of grounds and right to inform family</p>
          <div class="legal-quote">"No person accused of any offence shall be compelled to be a witness against himself." — Article 20(3)</div>
        `,
        actions: ['View source', 'Explain simply']
      },
      todo: {
        title: 'Actionable Steps You Can Take',
        content: `
          <ol>
            <li><strong>Politely Request Written Receipt:</strong> Ask for a formal seizure memo (Panchnama) listing all confiscated items with officer details.</li>
            <li><strong>Document the Details:</strong> Note down officer names, badge numbers, police vehicle numbers, date, exact time, and location.</li>
            <li><strong>Contact a Lawyer or NALSA:</strong> Inform your lawyer immediately or contact Free Legal Aid (15100).</li>
            <li><strong>File a Complaint:</strong> If procedures were violated, file a complaint with the Senior Superintendent of Police (SSP) or Police Complaints Authority (PCA).</li>
          </ol>
        `,
        actions: ['Draft a Message', 'Get legal help']
      },
      why: {
        title: 'Why This Legal Context Applies',
        content: `
          <div class="simple-explain">
            <div class="label">Your Query</div>
            <p>Inquiries regarding police search, phone seizure, or unlawful detention.</p>
          </div>
          <p>↓</p>
          <div class="simple-explain">
            <div class="label">Constitutional Connection</div>
            <p>Article 21 ensures state officers strictly adhere to procedure. Arbitrary searches without documentation violate fundamental liberty.</p>
          </div>
        `,
        actions: ['Ask a follow-up']
      },
      situation: {
        level: 'moderate',
        label: 'Moderate to High Priority',
        text: 'Police procedure issues require prompt documentation. Keep calm, request written memos, and consult legal counsel if property is withheld arbitrarily.'
      }
    },
    {
      keywords: ['landlord', 'tenant', 'deposit', 'rent', 'lease', 'evict', 'flat', 'owner', 'security deposit', 'housing'],
      queryType: 'landlord',
      title: 'Tenant & Security Deposit Remedies',
      summary: 'Legal remedies against landlords withholding security deposits or violating tenancy agreements.',
      response: `Here are your rights and step-by-step remedies regarding landlord security deposit disputes:

1. **Unlawful Deductions are Invalid**: A landlord cannot forfeit security deposits for standard wear-and-tear. Deductions require itemized receipts and proof of tenant damage.
2. **Mandatory Refund Timeline**: Most state Rent Control Acts and standard lease agreements require full deposit refund within 15-30 days of vacating.
3. **Legal Notice Requirement (Sec 106 TPA)**: Send a formal written legal notice giving 15 days to return the deposit with applicable interest.
4. **Legal Forum Options**: If unreturned, you can file a case in the local Rent Control Tribunal, Civil Court, or Consumer Forum for deficiency of service.`,
      rights: {
        title: 'Your Tenant Rights',
        content: `
          <div class="simple-explain">
            <div class="label">Transfer of Property Act (Section 108)</div>
            <p>Landlords are under statutory obligation to restore money held in trust once tenancy obligations are fulfilled.</p>
          </div>
          <div class="simple-explain">
            <div class="label">Consumer Protection Rights</div>
            <p>Rental housing services come under commercial service agreements. Unfair deposit retention is actionable under Consumer Law.</p>
          </div>
        `,
        actions: ['Explain simply', 'Show source']
      },
      law: {
        title: 'Governing Laws',
        content: `
          <p>• <strong>Model Tenancy Act / State Rent Control Acts</strong></p>
          <p>• <strong>Section 105 & 108</strong> — Transfer of Property Act, 1882</p>
          <p>• <strong>Consumer Protection Act, 2019</strong> — Service Deficiency</p>
          <div class="legal-quote">"Security deposit must be refunded to the tenant upon handing over peaceful possession of the premises."</div>
        `,
        actions: ['View source', 'Explain simply']
      },
      todo: {
        title: 'Steps to Recover Deposit',
        content: `
          <ol>
            <li><strong>Compile Proof:</strong> Gather lease contract, rent receipts, bank transfer records, and handover inspection photos.</li>
            <li><strong>Send Written Notice:</strong> Send a formal legal notice via Registered Post / Email demanding deposit return within 15 days.</li>
            <li><strong>Approach Rent Authority / Consumer Court:</strong> File an application for recovery along with interest (typically 6-12% p.a.) and litigation costs.</li>
          </ol>
        `,
        actions: ['Draft a Message', 'Get legal help']
      },
      why: {
        title: 'Why This Applies',
        content: `
          <div class="simple-explain">
            <div class="label">Rental Agreement Breach</div>
            <p>Landlords holding refundable deposits without substantiating physical property damage commit legal breach of trust.</p>
          </div>
        `,
        actions: ['Ask a follow-up']
      },
      situation: {
        level: 'moderate',
        label: 'Actionable Civil Dispute',
        text: 'Send a formal legal notice immediately. Over 85% of deposit withholding disputes are settled upon serving a legal notice.'
      }
    },
    {
      keywords: ['consumer', 'refund', 'complaint', 'online', 'company', 'defective', 'shopping', 'ecommerce', 'scam', 'fraud', 'service'],
      queryType: 'consumer',
      title: 'Consumer Protection & Online Refunds',
      summary: 'Rights under Consumer Protection Act 2019 for defective products, denied refunds, and unfair trade.',
      response: `Under the **Consumer Protection Act, 2019**, consumers are fully protected against unfair trade practices and refusal of legitimate refunds:

1. **Right to Refund & Replacement**: E-commerce platforms and vendors must process refunds for defective, wrong, or misrepresented goods within stated statutory timelines.
2. **National Consumer Helpline (NCH)**: File a fast online grievance at **consumerhelpline.gov.in** or call **1915** (Toll-Free). Resolution rate is over 90%.
3. **e-Daakhil Court Filing**: You can file a formal complaint online from home via **edaakhil.nic.in** without hiring a lawyer for claims up to ₹50 Lakhs.
4. **Compensation for Harassment**: Consumer courts routinely grant product cost refund + interest + compensation for mental harassment.`,
      rights: {
        title: 'Consumer Bill of Rights',
        content: `
          <div class="simple-explain">
            <div class="label">Right to Redressal</div>
            <p>Protection against unfair trade practices, misleading advertisements, and defective service delivery.</p>
          </div>
        `,
        actions: ['Explain simply', 'Show source']
      },
      law: {
        title: 'Consumer Protection Act 2019',
        content: `
          <p>• <strong>Section 2(47)</strong> — Unfair Trade Practice Definition</p>
          <p>• <strong>Consumer Protection (E-Commerce) Rules 2020</strong></p>
          <div class="legal-quote">"Refusal to take back goods or withdraw services and refund consideration paid is an unfair trade practice."</div>
        `,
        actions: ['View source', 'Explain simply']
      },
      todo: {
        title: 'Steps to File Complaint',
        content: `
          <ol>
            <li>Save invoice, order ID, payment proof, and customer support chat transcripts.</li>
            <li>Call National Consumer Helpline at **1915** or log onto **consumerhelpline.gov.in**.</li>
            <li>If unresolved in 15 days, file a case on **edaakhil.nic.in** for District Consumer Commission.</li>
          </ol>
        `,
        actions: ['Draft a Message', 'Get legal help']
      },
      why: {
        title: 'Why Consumer Law Applies',
        content: `
          <div class="simple-explain">
            <div class="label">Deficiency of Service</div>
            <p>Any paid transaction creates a legal consumer relationship safeguarding your right to full value or refund.</p>
          </div>
        `,
        actions: ['Ask a follow-up']
      },
      situation: {
        level: 'moderate',
        label: 'High Probability of Resolution',
        text: 'Filing on National Consumer Helpline (1915) usually compels companies to refund within 7-14 business days.'
      }
    },
    {
      keywords: ['article 14', 'article 19', 'article 21', 'article 12', 'article 13', 'article 15', 'article 16', 'article 32', 'constitution', 'fundamental right', 'writ', 'equality'],
      queryType: 'constitution',
      title: 'Constitutional & Fundamental Rights',
      summary: 'Deep breakdown of Part III Articles of the Indian Constitution (Articles 12-35).',
      response: `The **Constitution of India (Part III)** guarantees Fundamental Rights enforceable directly against the State:

1. **Article 14 (Right to Equality)**: Guarantees equality before law and equal protection of laws. The State cannot act arbitrarily.
2. **Article 15 & 16**: Prohibits state discrimination based on religion, race, caste, sex, or place of birth in public places and employment.
3. **Article 19 (Six Basic Freedoms)**: Freedom of speech, assembly, association, movement, residence, and trade/profession (subject to reasonable restrictions).
4. **Article 21 (Right to Life & Personal Liberty)**: The foundational pillar—no person shall be deprived of life or personal liberty except by procedure established by law.
5. **Article 32 (Right to Constitutional Remedies)**: Direct access to Supreme Court via Writs (*Habeas Corpus, Mandamus, Prohibition, Quo Warranto, Certiorari*).`,
      rights: {
        title: 'Core Fundamental Articles',
        content: `
          <div class="simple-explain">
            <div class="label">Article 14 — Equality before Law</div>
            <p>State must treat equals equally and avoid arbitrary classification.</p>
          </div>
          <div class="simple-explain">
            <div class="label">Article 21 — Life & Liberty</div>
            <p>Includes right to privacy, dignity, legal aid, clean environment, and fair trial.</p>
          </div>
        `,
        actions: ['Explain simply', 'Show source']
      },
      law: {
        title: 'Supreme Law of the Land',
        content: `
          <p>• <strong>Articles 12 to 35</strong> — Part III, Constitution of India</p>
          <div class="legal-quote">"Article 32 is the very heart and soul of the Constitution." — Dr. B.R. Ambedkar</div>
        `,
        actions: ['View source', 'Explain simply']
      },
      todo: {
        title: 'Enforcing Constitutional Rights',
        content: `
          <ol>
            <li>If fundamental rights are violated by public authorities, file a Writ Petition under Article 226 in High Court or Article 32 in Supreme Court.</li>
            <li>Approach State Human Rights Commission or legal aid boards.</li>
          </ol>
        `,
        actions: ['Draft a Message', 'Get legal help']
      },
      why: {
        title: 'Why It Applies',
        content: `
          <div class="simple-explain">
            <div class="label">State Accountability</div>
            <p>Every public official, police officer, and administrative body is bound by Part III of the Constitution.</p>
          </div>
        `,
        actions: ['Ask a follow-up']
      },
      situation: {
        level: 'high',
        label: 'Constitutional Protection',
        text: 'Fundamental rights override ordinary laws or executive notifications. Any law conflicting with Part III is void under Article 13.'
      }
    },
    {
      keywords: ['inheritance', 'will', 'father', 'mother', 'property', 'death', 'passed away', 'successor', 'ancestral', 'son', 'daughter', 'heir'],
      queryType: 'inheritance',
      title: 'Succession & Inheritance Laws',
      summary: 'Property inheritance rules when a family member passes away with or without a will.',
      response: `Here is an overview of property inheritance laws in India:

1. **Intestate Succession (Without a Will)**: If a person passes away without leaving a Will, property is distributed according to personal law (e.g., Hindu Succession Act 1956/2005 for Hindus, Buddhists, Jains, Sikhs).
2. **Equal Rights for Daughters (2005 Amendment)**: Daughters have equal coparcenary rights by birth in ancestral property, exactly like sons.
3. **Class I Legal Heirs**: Mother, Widow, Son, and Daughter receive equal shares of the deceased person's self-acquired property.
4. **Wills & Probate**: If a valid Will exists, property passes to named beneficiaries after obtaining Probate or Succession Certificate from Civil Court.`,
      rights: {
        title: 'Legal Heir Protections',
        content: `
          <div class="simple-explain">
            <div class="label">Hindu Succession Act (Section 8 & 15)</div>
            <p>Class I heirs take simultaneously to the exclusion of all other relatives.</p>
          </div>
        `,
        actions: ['Explain simply', 'Show source']
      },
      law: {
        title: 'Succession Acts',
        content: `
          <p>• <strong>Hindu Succession Act, 1956 (Amended 2005)</strong></p>
          <p>• <strong>Indian Succession Act, 1925</strong></p>
        `,
        actions: ['View source', 'Explain simply']
      },
      todo: {
        title: 'Required Legal Steps',
        content: `
          <ol>
            <li>Obtain Death Certificate from Revenue / Municipal Authorities.</li>
            <li>Apply for Legal Heirship Certificate / Family Member Certificate at Revenue Office (Tahsildar).</li>
            <li>Apply for Partition or Title Mutation in Revenue records.</li>
          </ol>
        `,
        actions: ['Draft a Message', 'Get legal help']
      },
      why: {
        title: 'Why Succession Law Applies',
        content: `
          <div class="simple-explain">
            <div class="label">Property Transfer</div>
            <p>Ownership cannot remain in a deceased person's name and must legally mutate to surviving legal heirs.</p>
          </div>
        `,
        actions: ['Ask a follow-up']
      },
      situation: {
        level: 'moderate',
        label: 'Civil Procedure Required',
        text: 'Obtain Legal Heir Certificate first from local Revenue Tehsildar before applying for bank account or property mutation.'
      }
    }
  ];

  // Default fallback knowledge item if query does not hit specific keywords
  const DEFAULT_KNOWLEDGE = {
    queryType: 'general',
    title: 'General Legal Awareness & Guidance',
    summary: 'General legal principles under Indian Law.',
    response: `Thank you for your legal query. In Indian jurisprudence:

1. **Rule of Law (Article 14)**: Every individual and authority is bound by the Constitution and statutory procedures.
2. **Documentation Matters**: Keep written records, receipts, messages, and timestamps of all relevant events.
3. **Legal Remedies Available**: Depending on your situation, remedies exist across Civil Courts, Consumer Commissions, High Courts (Article 226), or Statutory Authorities.
4. **Free Legal Aid (NALSA)**: Citizens earning below prescribed income thresholds or belonging to vulnerable categories qualify for 100% free legal representation under the Legal Services Authorities Act, 1987.

Would you like me to explain any specific article, act, or recommended next step?`,
    rights: {
      title: 'Your Basic Legal Protections',
      content: `
        <div class="simple-explain">
          <div class="label">Article 14 & 21</div>
          <p>Right to fair treatment, lawful procedure, and legal remedies.</p>
        </div>
      `,
      actions: ['Explain simply', 'Show source']
    },
    law: {
      title: 'Constitutional & Legal Framework',
      content: `
        <p>• <strong>Constitution of India</strong> — Articles 14, 19, 21, 32, 226</p>
        <p>• <strong>Legal Services Authorities Act, 1987</strong></p>
      `,
      actions: ['View source', 'Explain simply']
    },
    todo: {
      title: 'Recommended Actions',
      content: `
        <ol>
          <li>Gather and preserve all physical and digital evidence.</li>
          <li>Consult a qualified advocate or approach NALSA Free Legal Aid.</li>
        </ol>
      `,
      actions: ['Draft a Message', 'Get legal help']
    },
    why: {
      title: 'Why Legal Procedure Matters',
      content: `
        <div class="simple-explain">
          <div class="label">Lawful Remedies</div>
          <p>Understanding statutory provisions helps protect your personal liberty and rights.</p>
        </div>
      `,
      actions: ['Ask a follow-up']
    },
    situation: {
      level: 'moderate',
      label: 'General Legal Inquiry',
      text: 'For complex individual disputes, consulting an advocate or legal aid clinic is recommended.'
    }
  };

  // Match query against knowledge base
  function matchLegalQuery(text) {
    if (!text) return DEFAULT_KNOWLEDGE;
    const lower = text.toLowerCase();

    for (const item of LEGAL_KNOWLEDGE_BASE) {
      if (item.keywords.some(kw => lower.includes(kw))) {
        return item;
      }
    }
    return DEFAULT_KNOWLEDGE;
  }

  // Active knowledge item stored per message for dynamic CTA render
  let activeLegalContext = DEFAULT_KNOWLEDGE;

  // ======================== UTILITIES ========================
  function getCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  function showToast(message) {
    if (!DOM.toast || !DOM.toastMessage) return;
    DOM.toastMessage.textContent = message;
    DOM.toast.classList.add('show');
    setTimeout(() => DOM.toast.classList.remove('show'), 2200);
  }

  function scrollToBottom() {
    if (DOM.chatMessages) {
      requestAnimationFrame(() => {
        DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
      });
    }
  }

  function loadLocalConversations() {
    const saved = localStorage.getItem('lawoud-conversations');
    if (saved) {
      try {
        state.conversations = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved conversations', e);
      }
    } else {
      saveLocalConversations();
    }
  }

  function saveLocalConversations() {
    try {
      localStorage.setItem('lawoud-conversations', JSON.stringify(state.conversations));
    } catch (e) {
      console.error('Failed to save conversations', e);
    }
  }

  // Dynamically render list items in DOM from active state
  function renderRecentChats() {
    if (!DOM.recentChats) return;
    DOM.recentChats.innerHTML = '';

    const entries = Object.entries(state.conversations).sort((a, b) => b[0] - a[0]);

    entries.forEach(([id, conv]) => {
      const item = document.createElement('div');
      item.className = 'recent-chat-item';
      if (state.currentChatId === parseInt(id)) {
        item.classList.add('active');
      }
      item.role = 'button';
      item.tabIndex = 0;
      item.setAttribute('aria-label', conv.title);
      item.dataset.chatId = id;
      item.innerHTML = `
        <span class="chat-title">${conv.title}</span>
        <span class="chat-time">${conv.time}</span>
      `;

      const loadThisChat = () => loadChat(parseInt(id));
      item.addEventListener('click', loadThisChat);
      bindKeyboardClick(item, loadThisChat);

      DOM.recentChats.appendChild(item);
    });
  }

  function toggleSidebarDesktop() {
    if (!DOM.sidebar) return;
    DOM.sidebar.classList.toggle('collapsed');
    if (DOM.mobileMenuBtn) {
      DOM.mobileMenuBtn.classList.toggle('show-desktop', DOM.sidebar.classList.contains('collapsed'));
    }
  }

  // ======================== THEME ========================
  function initTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
    state.theme = 'dark';
  }

  // ======================== SIDEBAR ========================
  function openSidebar() {
    state.sidebarOpen = true;
    if (DOM.sidebar) DOM.sidebar.classList.add('open');
    if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    state.sidebarOpen = false;
    if (DOM.sidebar) DOM.sidebar.classList.remove('open');
    if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function handleNavClick(navItem) {
    if (!navItem) return;
    DOM.navItems.forEach(n => n.classList.remove('active'));
    navItem.classList.add('active');

    const nav = navItem.dataset.nav;
    closeSidebar();

    switch (nav) {
      case 'chat':
        if (state.currentChatId) {
          switchToChat();
        } else {
          switchToWelcome();
        }
        break;
      case 'history':
        openChatHistory();
        break;
      case 'rights':
        startDemoChat('What are my fundamental rights under the Constitution of India?',
          'Under Part III of the Constitution of India, citizens are guaranteed Fundamental Rights enforceable via Supreme Court (Art 32) & High Courts (Art 226):\n\n1. Article 14 — Right to Equality & equal protection of laws.\n2. Article 19 — Protection of 6 Freedoms (speech, assembly, movement, trade).\n3. Article 21 — Right to Life & Personal Liberty.\n4. Article 22 — Protection against arbitrary arrest & detention.');
        break;
      case 'constitution':
        startDemoChat('Tell me about the key articles of the Indian Constitution.',
          'The Constitution of India came into effect on 26 January 1950 and is the supreme law of the land.\n\nIt establishes a Sovereign, Socialist, Secular, Democratic Republic.\n\nKey sections include Part III (Fundamental Rights), Part IV (Directive Principles of State Policy), and Part IVA (Fundamental Duties).\n\nWhich specific article would you like to explore?');
        break;
      case 'findlaw':
        startDemoChat('I need to find a law related to tenant rights and consumer protection.',
          'Key legislations governing tenant rights and consumer protection in India:\n\n1. Consumer Protection Act, 2019 — Covers e-commerce, service deficiencies, and refund disputes.\n2. Transfer of Property Act, 1882 (Sec 105-108) — Regulates lease agreements and security deposit returns.\n3. State Rent Control Acts — Protect tenants against unlawful eviction.');
        break;
      case 'legalaid':
        openLegalHelp();
        break;
      case 'docexplainer':
        startDemoChat('I have a legal document I need help understanding.',
          'I can help break down complex legal documents into plain English.\n\nYou can attach a document (.pdf, .doc, .txt, .png) or paste the legal text here.\n\nI will analyze the clauses, highlight obligations, and explain your rights step by step.');
        break;
    }
  }

  // ======================== ACCOUNT DROPDOWN ========================
  function openAccountMenu() {
    if (DOM.accountDropdown) DOM.accountDropdown.classList.add('show');
    if (DOM.accountBtn) {
      DOM.accountBtn.classList.add('open');
      DOM.accountBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeAccountMenu() {
    if (DOM.accountDropdown) DOM.accountDropdown.classList.remove('show');
    if (DOM.accountBtn) {
      DOM.accountBtn.classList.remove('open');
      DOM.accountBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleAccountMenu() {
    if (DOM.accountDropdown && DOM.accountDropdown.classList.contains('show')) {
      closeAccountMenu();
    } else {
      openAccountMenu();
    }
  }

  // ======================== MODALS ========================
  function openModal(modal) {
    if (!modal) return;
    if (DOM.modalOverlay) DOM.modalOverlay.classList.add('show');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeAllModals() {
    if (DOM.modalOverlay) DOM.modalOverlay.classList.remove('show');
    $$('.modal.show').forEach(m => m.classList.remove('show'));
    document.body.style.overflow = '';
  }

  function openShareModal() {
    openModal(DOM.shareModal);
  }

  function openLegalHelp() {
    openModal(DOM.legalHelpModal);
  }

  function openChatHistory() {
    if (!DOM.historyList) return;
    DOM.historyList.innerHTML = '';
    Object.entries(state.conversations).forEach(([id, conv]) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', conv.title);
      item.innerHTML = `
        <span class="h-title">${conv.title}</span>
        <span class="h-time">${conv.time}</span>
      `;
      const selectChat = () => {
        closeAllModals();
        loadChat(parseInt(id));
      };
      item.addEventListener('click', selectChat);
      bindKeyboardClick(item, selectChat);

      DOM.historyList.appendChild(item);
    });
    openModal(DOM.chatHistoryModal);
  }

  // ======================== CHAT MANAGEMENT ========================
  function switchToChat() {
    state.currentView = 'chat';
    if (DOM.welcomeState) DOM.welcomeState.classList.add('hidden');
    if (DOM.chatMessages) DOM.chatMessages.classList.remove('hidden');
    if (DOM.newChatHeader) DOM.newChatHeader.classList.remove('hidden');
    if (DOM.chatInput) DOM.chatInput.placeholder = 'Ask a follow-up legal question...';
    if (DOM.headerTitle) DOM.headerTitle.innerHTML = '<span class="law">LAW</span><span class="oud" style="color:var(--gold);">oud</span>';
    if (DOM.headerSubtitle) DOM.headerSubtitle.textContent = 'Your Constitutional & Legal Awareness Assistant';
  }

  function switchToWelcome() {
    state.currentView = 'welcome';
    state.currentChatId = null;
    state.currentMessages = [];
    if (DOM.welcomeState) DOM.welcomeState.classList.remove('hidden');
    if (DOM.chatMessages) {
      DOM.chatMessages.classList.add('hidden');
      DOM.chatMessages.innerHTML = '';
    }
    if (DOM.newChatHeader) DOM.newChatHeader.classList.add('hidden');
    if (DOM.chatInput) {
      DOM.chatInput.placeholder = 'Type your legal question here...';
      DOM.chatInput.value = '';
      DOM.chatInput.style.height = 'auto';
    }
    if (DOM.headerTitle) DOM.headerTitle.innerHTML = '<span class="law">LAW</span><span class="oud" style="color:var(--gold);">oud</span>';
    if (DOM.headerSubtitle) DOM.headerSubtitle.textContent = 'Your Constitutional & Legal Awareness Assistant';
    removeAttachment();
  }

  function newChat() {
    switchToWelcome();
    DOM.navItems.forEach(n => n.classList.remove('active'));
    if (DOM.navItems[0]) DOM.navItems[0].classList.add('active');
    renderRecentChats();
  }

  function loadChat(chatId) {
    const conv = state.conversations[chatId];
    if (!conv) return;

    state.currentChatId = chatId;
    state.currentMessages = [...conv.messages];

    switchToChat();
    if (DOM.chatMessages) DOM.chatMessages.innerHTML = '';

    conv.messages.forEach((msg, idx) => {
      const isLast = idx === conv.messages.length - 1 && msg.type === 'ai';
      addMessageToDOM(msg.type, msg.text, msg.time, isLast, matchLegalQuery(msg.text));
    });

    renderRecentChats();
    scrollToBottom();
    closeSidebar();
  }

  function startDemoChat(userText, aiReply) {
    if (state.isGenerating) return;
    const newId = Date.now();
    const matchedKnowledge = matchLegalQuery(userText);
    activeLegalContext = matchedKnowledge;

    state.conversations[newId] = {
      title: userText.substring(0, 32) + (userText.length > 32 ? '...' : ''),
      time: getCurrentTime(),
      messages: []
    };
    state.currentChatId = newId;
    state.currentMessages = state.conversations[newId].messages;

    switchToChat();
    if (DOM.chatMessages) DOM.chatMessages.innerHTML = '';
    renderRecentChats();

    addMessage('user', userText);

    showTypingIndicator();
    state.isGenerating = true;

    // Fast responsive delay (<250ms)
    setTimeout(() => {
      removeTypingIndicator();
      addMessage('ai', aiReply || matchedKnowledge.response);
      state.isGenerating = false;
    }, 220);
  }

  // ======================== MESSAGES ========================
  function addMessage(type, text) {
    const time = getCurrentTime();
    const msg = { type, text, time };
    state.currentMessages.push(msg);

    if (type === 'user') {
      activeLegalContext = matchLegalQuery(text);
    }

    if (state.currentChatId && state.conversations[state.currentChatId]) {
      state.conversations[state.currentChatId].messages = state.currentMessages;
      saveLocalConversations();
    }

    const isLast = type === 'ai';
    addMessageToDOM(type, text, time, isLast, activeLegalContext);
    scrollToBottom();
  }

  function addMessageToDOM(type, text, time, showCTAs, knowledgeContext) {
    if (!DOM.chatMessages) return;

    const wrapper = document.createElement('div');
    wrapper.className = `message ${type}`;

    const avatarSVG = type === 'ai'
      ? `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M18 4v24M11 10h14M7 10l4 10h0a5 5 0 0010 0h0l4-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
           <path d="M7 20c0 2.8 2.2 3.5 4 3.5s4-.7 4-3.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
           <path d="M21 20c0 2.8 2.2 3.5 4 3.5s4-.7 4-3.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
           <path d="M13 28h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
         </svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
         </svg>`;

    const paragraphs = text.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');

    let metaHTML = '';
    if (type === 'user') {
      metaHTML = `
        <div class="message-meta">
          <span class="message-time">${time || getCurrentTime()}</span>
          <span class="message-status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 12 5 16 10 10"/>
              <polyline points="7 12 11 16 20 6"/>
            </svg>
          </span>
        </div>`;
    }

    let actionsHTML = '';
    if (type === 'ai') {
      actionsHTML = `
        <div class="message-actions">
          <button class="msg-action-btn" aria-label="Like response" title="Like" data-action="like">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
          </button>
          <button class="msg-action-btn" aria-label="Dislike response" title="Dislike" data-action="dislike">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
            </svg>
          </button>
          <button class="msg-action-btn" aria-label="Copy response" title="Copy response" data-action="copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>`;
    }

    wrapper.innerHTML = `
      <div class="message-avatar" aria-hidden="true">${avatarSVG}</div>
      <div class="message-content">
        <div class="message-bubble">${paragraphs}</div>
        ${metaHTML}
        ${actionsHTML}
      </div>
    `;

    DOM.chatMessages.appendChild(wrapper);

    // Add message action listeners
    wrapper.querySelectorAll('.msg-action-btn').forEach(btn => {
      btn.addEventListener('click', () => handleMessageAction(btn, text));
    });

    // Add CTAs after AI response
    if (showCTAs && type === 'ai') {
      addLegalCTAs(knowledgeContext || activeLegalContext);
      scrollToBottom();
    }
  }

  function handleMessageAction(btn, text) {
    const action = btn.dataset.action;
    switch (action) {
      case 'like':
        btn.classList.toggle('liked');
        if (btn.classList.contains('liked')) showToast('Response liked');
        break;
      case 'dislike':
        btn.classList.toggle('liked');
        if (btn.classList.contains('liked')) showToast('Feedback submitted');
        break;
      case 'copy':
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard'));
        } else {
          showToast('Copied to clipboard');
        }
        break;
    }
  }

  // ======================== LEGAL CTA CARDS ========================
  function addLegalCTAs(knowledgeContext) {
    if (!DOM.chatMessages) return;

    const ctx = knowledgeContext || activeLegalContext || DEFAULT_KNOWLEDGE;

    const ctaData = [
      { key: 'rights', label: 'Your Rights', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
      { key: 'law', label: 'Relevant Law', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` },
      { key: 'todo', label: 'What You Can Do', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>` },
      { key: 'why', label: 'Why This Applies', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
      { key: 'situation', label: 'Situation Check', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` },
      { key: 'help', label: 'Get Legal Help', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
    ];

    const container = document.createElement('div');
    container.className = 'legal-ctas';

    ctaData.forEach(cta => {
      const btn = document.createElement('button');
      btn.className = 'legal-cta';
      btn.setAttribute('aria-label', cta.label);
      btn.tabIndex = 0;
      btn.innerHTML = `
        <div class="legal-cta-icon">${cta.icon}</div>
        <span class="legal-cta-title">${cta.label}</span>
      `;
      const triggerCard = () => showLegalSection(cta.key, ctx);
      btn.addEventListener('click', triggerCard);
      bindKeyboardClick(btn, triggerCard);
      container.appendChild(btn);
    });

    DOM.chatMessages.appendChild(container);
  }

  // ======================== LEGAL SECTIONS ========================
  function showLegalSection(type, knowledgeContext) {
    const ctx = knowledgeContext || activeLegalContext || DEFAULT_KNOWLEDGE;

    if (type === 'help') {
      openLegalHelp();
      return;
    }

    const data = ctx[type];
    if (!data) return;

    const section = document.createElement('div');
    section.className = 'legal-section';

    if (type === 'situation') {
      const situationClass = data.level || 'moderate';
      section.innerHTML = `
        <div class="legal-section-card">
          <div class="legal-section-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <h3>Situation Assessment</h3>
          </div>
          <div class="legal-section-body">
            <div class="situation-level ${situationClass}">
              <span class="situation-dot"></span>
              <span class="situation-label">${data.label}</span>
            </div>
            <p style="margin-top:12px;">${data.text}</p>
          </div>
          <div class="legal-section-actions">
            <button class="legal-action-btn" data-section-action="help">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Get Legal Help
            </button>
          </div>
        </div>
      `;
    } else {
      let actionsHTML = '';
      if (data.actions && data.actions.length > 0) {
        actionsHTML = `<div class="legal-section-actions">
          ${data.actions.map(a => {
            if (a === 'Draft a Message') {
              return `<button class="legal-action-btn" data-section-action="draft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                ${a}
              </button>`;
            }
            if (a === 'Get legal help') {
              return `<button class="legal-action-btn" data-section-action="help">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                ${a}
              </button>`;
            }
            if (a === 'Ask a follow-up') {
              return `<button class="legal-action-btn" data-section-action="followup">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${a}
              </button>`;
            }
            return `<button class="legal-action-btn" data-section-action="info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              ${a}
            </button>`;
          }).join('')}
        </div>`;
      }

      section.innerHTML = `
        <div class="legal-section-card">
          <div class="legal-section-header">
            <h3>${data.title}</h3>
          </div>
          <div class="legal-section-body">
            ${data.content}
          </div>
          ${actionsHTML}
        </div>
      `;
    }

    DOM.chatMessages.appendChild(section);

    section.querySelectorAll('.legal-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.sectionAction;
        switch (action) {
          case 'draft':
            addMessage('ai', `Here is a formal legal notice draft tailored for your situation:\n\n"FORMAL LEGAL NOTICE\n\nTo,\n[Opposite Party Name / Authority]\n[Address]\n\nSUBJECT: DEMAND NOTICE FOR COMPLIANCE AND REMEDY\n\nSir/Madam,\n\nUnder instructions from my client / on my own behalf, I hereby call upon you to address the following facts:\n\n1. That on [Date], an incident occurred regarding [brief details].\n2. That under the Constitution of India and relevant statutory rules, proper procedure and fundamental rights must be respected.\n3. You are hereby called upon to rectify the violation and issue compliance within 15 days of receipt of this notice, failing which legal proceedings will be initiated.\n\nSincerely,\n[Your Name]"\n\nYou can copy and customize this notice.`);
            break;
          case 'help':
            openLegalHelp();
            break;
          case 'followup':
            if (DOM.chatInput) DOM.chatInput.focus();
            break;
          default:
            showToast('Information displayed above');
        }
      });
    });

    scrollToBottom();
  }

  // ======================== SEND MESSAGE ========================
  function sendMessage() {
    if (!DOM.chatInput) return;
    const text = DOM.chatInput.value.trim();
    if (!text || state.isGenerating) return;

    if (state.currentView !== 'chat') {
      switchToChat();
    }

    DOM.chatInput.value = '';
    DOM.chatInput.style.height = 'auto';
    removeAttachment();

    if (state.currentChatId === null) {
      const newId = Date.now();
      state.conversations[newId] = {
        title: text.substring(0, 32) + (text.length > 32 ? '...' : ''),
        time: getCurrentTime(),
        messages: []
      };
      state.currentChatId = newId;
      state.currentMessages = state.conversations[newId].messages;
      renderRecentChats();
    }

    addMessage('user', text);

    showTypingIndicator();
    state.isGenerating = true;

    // Fast responsive response (sub-250ms for high performance)
    setTimeout(() => {
      removeTypingIndicator();
      const matched = matchLegalQuery(text);
      addMessage('ai', matched.response);
      state.isGenerating = false;
    }, 200);
  }

  // ======================== TYPING INDICATOR ========================
  function showTypingIndicator() {
    if (!DOM.chatMessages) return;
    removeTypingIndicator();

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
      <div class="message-avatar" aria-hidden="true" style="background:linear-gradient(135deg,rgba(216,155,60,0.15),rgba(216,155,60,0.05));border:1px solid var(--border-gold);color:var(--gold);">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:18px;height:18px;">
          <path d="M18 4v24M11 10h14M7 10l4 10h0a5 5 0 0010 0h0l4-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          <path d="M7 20c0 2.8 2.2 3.5 4 3.5s4-.7 4-3.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M21 20c0 2.8 2.2 3.5 4 3.5s4-.7 4-3.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M13 28h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="typing-dots" aria-label="LAWoud is analyzing legal sources">
        <span></span><span></span><span></span>
      </div>
    `;
    DOM.chatMessages.appendChild(indicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = $('#typingIndicator');
    if (indicator) indicator.remove();
  }

  // ======================== FILE ATTACHMENT ========================
  function handleFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      state.attachedFileName = file.name;
      if (DOM.attachedFileName) DOM.attachedFileName.textContent = file.name;
      if (DOM.attachedFile) DOM.attachedFile.classList.add('show');
      showToast(`Attached ${file.name}`);
    }
  }

  function removeAttachment() {
    state.attachedFileName = null;
    if (DOM.attachedFile) DOM.attachedFile.classList.remove('show');
    if (DOM.fileInput) DOM.fileInput.value = '';
  }

  // ======================== VOICE INPUT ========================
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        state.recognition = new SpeechRecognition();
        state.recognition.continuous = false;
        state.recognition.interimResults = false;
        state.recognition.lang = 'en-IN';

        state.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (DOM.chatInput) DOM.chatInput.value = transcript;
          stopRecording();
          showToast('Voice captured successfully');
        };

        state.recognition.onerror = () => {
          stopRecording();
          showToast('Voice input unavailable. Please type your question.');
        };

        state.recognition.onend = () => {
          stopRecording();
        };
      } catch (e) {
        console.warn('Speech recognition error:', e);
      }
    }
  }

  function toggleRecording() {
    if (!state.recognition) {
      showToast('Voice input is not supported in this browser environment.');
      return;
    }

    if (state.isRecording) {
      try { state.recognition.stop(); } catch(e) {}
      stopRecording();
    } else {
      try {
        state.recognition.start();
        startRecording();
      } catch(e) {
        showToast('Voice input error. Please type your message.');
      }
    }
  }

  function startRecording() {
    state.isRecording = true;
    if (DOM.micBtn) {
      DOM.micBtn.classList.add('recording-indicator');
      DOM.micBtn.title = 'Stop recording';
    }
    showToast('Listening... Speak now');
  }

  function stopRecording() {
    state.isRecording = false;
    if (DOM.micBtn) {
      DOM.micBtn.classList.remove('recording-indicator');
      DOM.micBtn.title = 'Use voice input';
    }
  }

  // ======================== EVENT LISTENERS ========================
  function bindEvents() {
    // Sidebar Toggles
    safeAddListener(DOM.mobileMenuBtn, 'click', () => {
      if (window.innerWidth <= 768) {
        openSidebar();
      } else {
        toggleSidebarDesktop();
      }
    });

    safeAddListener(DOM.sidebarOverlay, 'click', closeSidebar);

    safeAddListener(DOM.sidebarCollapseBtn, 'click', () => {
      if (window.innerWidth <= 768) {
        closeSidebar();
      } else {
        toggleSidebarDesktop();
      }
    });

    // Nav Items
    if (DOM.navItems && DOM.navItems.length > 0) {
      DOM.navItems.forEach(item => {
        item.addEventListener('click', () => handleNavClick(item));
        bindKeyboardClick(item, () => handleNavClick(item));
      });
    }

    // Welcome Prompt Suggestions Cards
    if (DOM.welcomeSuggestions) {
      const cards = DOM.welcomeSuggestions.querySelectorAll('.suggestion-card');
      cards.forEach(card => {
        const promptText = card.dataset.prompt;
        const triggerPrompt = () => {
          if (DOM.chatInput) DOM.chatInput.value = promptText;
          sendMessage();
        };
        card.addEventListener('click', triggerPrompt);
        bindKeyboardClick(card, triggerPrompt);
      });
    }

    // New Chat
    safeAddListener(DOM.newChatSidebar, 'click', newChat);
    safeAddListener(DOM.newChatHeader, 'click', newChat);

    // Textarea Auto-Resize Focus and Input
    safeAddListener(DOM.chatInput, 'input', () => {
      if (DOM.chatInput) {
        DOM.chatInput.style.height = 'auto';
        DOM.chatInput.style.height = Math.min(DOM.chatInput.scrollHeight, 180) + 'px';
      }
    });

    // Chat Input Keydown (Enter to send, Shift+Enter for newline)
    safeAddListener(DOM.chatInput, 'keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Account Dropdown
    safeAddListener(DOM.accountBtn, 'click', (e) => {
      e.stopPropagation();
      toggleAccountMenu();
    });

    $$('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        closeAccountMenu();
        switch (action) {
          case 'profile':
            showToast('User Profile: Saisanjay Suresh (Verified Citizen)');
            break;
          case 'settings':
            showToast('LAWoud Settings: Dark Mode Active');
            break;
          case 'logout':
            showToast('Logged out of LAWoud session');
            break;
        }
      });
    });

    // Modal Options inside Legal Help Modal
    $$('#legalHelpModal .modal-option').forEach(opt => {
      const handler = () => {
        closeAllModals();
        showToast(`Redirecting to ${opt.textContent.trim()} service...`);
      };
      opt.addEventListener('click', handler);
      bindKeyboardClick(opt, handler);
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (DOM.accountBtn && DOM.accountDropdown) {
        if (!DOM.accountBtn.contains(e.target) && !DOM.accountDropdown.contains(e.target)) {
          closeAccountMenu();
        }
      }
    });

    // Share Modal
    safeAddListener(DOM.shareBtn, 'click', openShareModal);
    safeAddListener(DOM.shareModalClose, 'click', closeAllModals);
    safeAddListener(DOM.shareCopyBtn, 'click', () => {
      if (DOM.shareLinkInput) {
        DOM.shareLinkInput.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(DOM.shareLinkInput.value);
        }
        showToast('Share link copied to clipboard');
        closeAllModals();
      }
    });

    // Save Chat
    safeAddListener(DOM.saveChatBtn, 'click', () => {
      saveLocalConversations();
      showToast('Chat saved to LAWoud history');
    });

    // Chat History Modal Close
    safeAddListener(DOM.chatHistoryModalClose, 'click', closeAllModals);
    safeAddListener(DOM.legalHelpModalClose, 'click', closeAllModals);

    // Modal overlay close
    safeAddListener(DOM.modalOverlay, 'click', closeAllModals);

    // Send Button
    safeAddListener(DOM.sendBtn, 'click', sendMessage);

    // File attachment
    safeAddListener(DOM.attachBtn, 'click', () => {
      if (DOM.fileInput) DOM.fileInput.click();
    });
    safeAddListener(DOM.fileInput, 'change', handleFileSelect);
    safeAddListener(DOM.removeFileBtn, 'click', removeAttachment);

    // Mic Button
    safeAddListener(DOM.micBtn, 'click', toggleRecording);

    // Keyboard Shortcuts (Global listener for Escape, Ctrl+K / '/', Alt+N)
    document.addEventListener('keydown', (e) => {
      // Escape key closes active overlays/modals
      if (e.key === 'Escape') {
        closeAllModals();
        closeAccountMenu();
        closeSidebar();
      }

      // '/' or Ctrl+K / Cmd+K to focus input box
      if ((e.key === '/' && document.activeElement !== DOM.chatInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        if (DOM.chatInput) DOM.chatInput.focus();
      }

      // Alt+N or Ctrl+Shift+O for New Chat
      if ((e.altKey && e.key.toLowerCase() === 'n') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o')) {
        e.preventDefault();
        newChat();
      }
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeSidebar();
      }
    });
  }

  // ======================== INIT ========================
  function init() {
    try {
      loadLocalConversations();
      initTheme();
      initSpeechRecognition();
      renderRecentChats();
      bindEvents();
    } catch (err) {
      console.error('Initialization error in LAWoud script:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
