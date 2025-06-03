// Quiz functionality
class TRTQuiz {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.answers = {};
        this.recommendation = null;
        this.userName = null;
        this.init();
    }

    init() {
        this.bindEvents();
        // Initially hide all question sections except the first
        document.getElementById('question-2').style.display = 'none';
        document.getElementById('question-3').style.display = 'none';
        document.getElementById('question-4').style.display = 'none';
        document.getElementById('question-5').style.display = 'none';
    }

    bindEvents() {
        // Answer button click handlers for first question
        const firstQuestionButtons = document.querySelectorAll('.first-question-section .answer-btn');
        firstQuestionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectAnswer(e.target);
            });
        });

        // Answer button click handlers for question 2
        this.bindQuestionEvents('question-2');
        
        // Answer button click handlers for question 3
        this.bindQuestionEvents('question-3');
        
        // Answer button click handlers for question 4
        this.bindQuestionEvents('question-4');
        
        // Answer button click handlers for question 5
        this.bindQuestionEvents('question-5');
    }

    bindQuestionEvents(questionId) {
        const questionButtons = document.querySelectorAll(`#${questionId} .answer-btn`);
        questionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectQuestionAnswer(e.target, questionId);
            });
        });
    }

    selectAnswer(button) {
        // Remove previous selection
        const allButtons = document.querySelectorAll('.first-question-section .answer-btn');
        allButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Add selection to clicked button
        button.classList.add('selected');
        
        // Store answer
        this.answers[this.currentStep] = button.textContent;
        
        // Auto-advance to next step after short delay
        setTimeout(() => {
            this.nextStep();
        }, 200);
    }

    selectQuestionAnswer(button, questionId) {
        // Remove previous selection within this question
        const questionButtons = document.querySelectorAll(`#${questionId} .answer-btn`);
        questionButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Add selection to clicked button
        button.classList.add('selected');
        
        // Store answer
        this.answers[this.currentStep] = button.textContent;
        
        // Auto-advance to next step after short delay
        setTimeout(() => {
            this.nextStep();
        }, 200);
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showNextQuestion();
        } else {
            this.completeQuiz();
        }
    }

    showNextQuestion() {
        // Show the appropriate question section
        const nextQuestionId = `question-${this.currentStep}`;
        const nextSection = document.getElementById(nextQuestionId);
        
        if (nextSection) {
            // Show the next section
            nextSection.style.display = 'flex';
            
            // Fast scroll to the next section
            this.fastScrollTo(nextSection);
        }
    }

    fastScrollTo(element) {
        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 400; // 400ms for snappy animation
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation.bind(this));
        }

        requestAnimationFrame(animation.bind(this));
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    completeQuiz() {
        // Calculate product recommendation locally (this will also be done server-side)
        this.recommendation = this.calculateProductRecommendation();
        
        console.log('Quiz completed!', this.answers);
        console.log('Calculated recommendation:', this.recommendation);
        
        this.showContactForm();
    }

    calculateProductRecommendation() {
        const recommendations = {
            primary: '',
            reasoning: ''
        };

        // Analyze answer to question 3 (erectile function) to determine treatment type
        const answer3 = this.answers[3]?.toLowerCase() || '';

        // Recommendation based on erectile function answer
        if (answer3.includes('yes')) {
            recommendations.primary = 'Enclomiphene + Tadalafil';
            recommendations.reasoning = 'Based on your sexual performance challenges, we recommend our combination therapy';
        } else if (answer3.includes('no')) {
            recommendations.primary = 'Enclomiphene';
            recommendations.reasoning = 'Based on your goals, we recommend our testosterone optimization therapy';
        } else {
            recommendations.primary = 'Enclomiphene';
            recommendations.reasoning = 'Our medical team will determine the best treatment option for you';
        }

        return recommendations;
    }

    showContactForm() {
        // Show the contact form section
        const contactSection = document.getElementById('contact-form');
        contactSection.style.display = 'flex';
        
        // Fast scroll to the contact form
        this.fastScrollTo(contactSection);
        
        // Bind form submit event
        this.bindFormEvents();
    }

    bindFormEvents() {
        const form = document.getElementById('contact-form-element');
        const skipLink = document.querySelector('.skip-discount-link');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(form);
        });

        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRecommendationSection();
        });
    }

    async handleFormSubmit(form) {
        const formData = new FormData(form);
        const contactInfo = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phoneNumber: formData.get('phoneNumber') || '', // Optional phone field
            answers: this.answers,
            recommendation: this.recommendation
        };
        
        console.log('Submitting quiz data:', contactInfo);
        
        // Show loading state
        const submitButton = form.querySelector('.form-submit-btn');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'SUBMITTING...';
        submitButton.disabled = true;

        try {
            // Send directly to Customer.io using their JavaScript SDK
            if (typeof _cio !== 'undefined') {
                // Identify the customer
                _cio.identify({
                    id: contactInfo.email,
                    email: contactInfo.email,
                    name: contactInfo.fullName,
                    phone: contactInfo.phoneNumber, // Add phone number to Customer.io
                    // Quiz answers
                    quiz_answer_1: this.answers[1] || '',
                    quiz_answer_2: this.answers[2] || '',
                    quiz_answer_3: this.answers[3] || '',
                    quiz_answer_4: this.answers[4] || '',
                    quiz_answer_5: this.answers[5] || '',
                    // Recommendations
                    primary_product_recommendation: this.recommendation.primary,
                    recommendation_reasoning: this.recommendation.reasoning,
                    // Metadata
                    quiz_completed_at: new Date().toISOString(),
                    quiz_version: '1.0',
                    lead_source: 'enclomiphene_quiz',
                    // Contact preferences
                    phone_number_provided: contactInfo.phoneNumber ? 'yes' : 'no',
                    care_team_contact_requested: contactInfo.phoneNumber ? 'yes' : 'no'
                });

                // Track quiz completion event
                _cio.track('quiz_completed', {
                    quiz_type: 'enclomiphene_assessment',
                    primary_recommendation: this.recommendation.primary,
                    total_questions: 5,
                    completed_at: new Date().toISOString(),
                    phone_provided: contactInfo.phoneNumber ? true : false
                });

                console.log('Successfully sent data to Customer.io');
                
                // Store the user's name for personalization
                this.userName = contactInfo.fullName;
                
                // Show the recommendation section
                this.showRecommendationSection();
                
            } else {
                throw new Error('Customer.io tracking script not loaded');
            }

        } catch (error) {
            console.error('Error sending to Customer.io:', error);
            
            // Still show recommendations even if tracking fails
            this.userName = contactInfo.fullName;
            this.showRecommendationSection();
            
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    showRecommendationSection() {
        // Show the recommendation section
        const recommendationSection = document.getElementById('recommendation-section');
        recommendationSection.style.display = 'block';
        
        // Show the user goals section
        const userGoalsSection = document.getElementById('user-goals-section');
        userGoalsSection.style.display = 'block';
        
        // Show the comparison chart section
        const comparisonChartSection = document.getElementById('comparison-chart-section');
        comparisonChartSection.style.display = 'block';
        
        // Show the process section
        const processSection = document.getElementById('process-section');
        processSection.style.display = 'block';
        
        // Show the testimonials section
        const testimonialsSection = document.getElementById('testimonials-section');
        testimonialsSection.style.display = 'block';
        
        // Show the FAQ section
        const faqSection = document.getElementById('faq-section');
        faqSection.style.display = 'block';
        
        // Show the footer section
        const footerSection = document.getElementById('footer-section');
        footerSection.style.display = 'block';
        
        // Personalize the content
        this.personalizeRecommendation();
        this.personalizeUserGoals();
        
        // Update comparison chart based on Q3 answer
        this.updateComparisonChart();
        
        // Update FAQs based on question 3 answer
        this.updateFAQs();
        
        // Fast scroll to the recommendation section
        this.fastScrollTo(recommendationSection);
    }

    personalizeUserGoals() {
        // Update the personalized header with user name
        const headerElement = document.getElementById('user-goals-header');
        if (this.userName) {
            const firstName = this.userName.split(' ')[0];
            headerElement.textContent = `${firstName}, based on your goals:`;
        } else {
            headerElement.textContent = "Based on your goals:";
        }

        // Populate the goal items with answers from questions 1, 2, and 4
        const goal1Element = document.getElementById('goal-1');
        const goal2Element = document.getElementById('goal-2');
        const goal4Element = document.getElementById('goal-4');

        if (this.answers[1]) {
            goal1Element.textContent = this.answers[1];
        }
        if (this.answers[2]) {
            goal2Element.textContent = this.answers[2];
        }
        if (this.answers[4]) {
            goal4Element.textContent = this.answers[4];
        }

        // Personalize the benefits section
        this.personalizeBenefitsSection();
    }

    personalizeBenefitsSection() {
        // Determine product based on answer to question 3
        const question3Answer = this.answers[3]?.toLowerCase() || '';
        let productData = this.getProductData(question3Answer);

        // Update benefits product name
        const benefitsProductName = document.getElementById('benefits-product-name');
        benefitsProductName.textContent = productData.name;

        // Update benefits recommendation text
        const benefitsRecommendationText = document.getElementById('benefits-recommendation-text');
        benefitsRecommendationText.textContent = productData.description;
    }

    personalizeRecommendation() {
        // Update the personalized title
        const titleElement = document.getElementById('recommendation-title');
        if (this.userName) {
            titleElement.textContent = `${this.userName}, here's your personal recommendation`;
        } else {
            titleElement.textContent = "Here's your personal recommendation";
        }

        // Determine product based on answer to question 3
        const question3Answer = this.answers[3]?.toLowerCase() || '';
        let productData = this.getProductData(question3Answer);

        // Update product image
        const productImage = document.getElementById('product-image');
        productImage.src = productData.image;
        productImage.alt = productData.name;

        // Update product header
        const productHeader = document.getElementById('product-header');
        productHeader.textContent = productData.name;

        // Update product description
        const productDescription = document.getElementById('product-description');
        productDescription.textContent = productData.description;

        // Update pricing based on Q3 answer
        this.updatePricing(question3Answer);

        // Update hero image based on recommendation
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            if (question3Answer.includes('yes')) {
                // Enclomiphene + Tadalafil recommendation
                heroImage.src = 'assets/enclomiphene+tadalafil_product.png';
                heroImage.alt = 'Enclomiphene + Tadalafil - Testosterone optimization with enhanced sexual performance';
            } else {
                // Enclomiphene recommendation  
                heroImage.src = 'assets/enclomiphene.png';
                heroImage.alt = 'Enclomiphene - Natural testosterone optimization therapy';
            }
        }
    }

    getProductData(answer) {
        if (answer.includes('yes')) {
            return {
                name: 'Enclomiphene + Tadalafil',
                image: 'assets/enclomiphene+tadalafil_product.png',
                description: 'It is a powerful combination therapy that naturally boosts testosterone while enhancing sexual performance. Enclomiphene stimulates your body\'s natural testosterone production, while tadalafil improves blood flow and erectile function.'
            };
        } else if (answer.includes('no')) {
            return {
                name: 'Enclomiphene',
                image: 'assets/enclomiphene.png',
                description: 'It raises natural testosterone levels by up to 2.5x, with no testicular shutdown. It is a selective estrogen receptor modulator that naturally stimulates your body to produce more testosterone. This once-daily pill is a safe and effective way to optimize your testosterone levels.'
            };
        } else {
            // Default to Enclomiphene
            return {
                name: 'Enclomiphene',
                image: 'assets/enclomiphene.png',
                description: 'A selective estrogen receptor modulator that naturally stimulates your body to produce more testosterone. This oral medication helps optimize hormone levels without suppressing your natural production.'
            };
        }
    }

    updatePricing(answer) {
        const monthlyTreatmentPrice = document.getElementById('monthly-treatment-price');
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        // Show both pricing cards for both products
        pricingCards.forEach(card => {
            card.style.display = 'block';
        });
        
        // Update pricing based on selection
        if (answer && answer.toLowerCase().includes('yes')) {
            // Enclomiphene + Tadalafil pricing
            monthlyTreatmentPrice.innerHTML = '$125 <span class="pricing-period">/ first month</span>';
        } else {
            // Enclomiphene pricing
            monthlyTreatmentPrice.innerHTML = '$104 <span class="pricing-period">/ first month</span>';
        }
    }

    getFAQData(productType) {
        const faqData = {
            enclomiphene: [
                {
                    question: "What's the cost and what's included?",
                    answer: "Treatment starts with a one-time payment of $95 for initial lab work and consultation. This payment is applied to your first month's cost, if prescribed. Monthly treatment is $104/first month and includes medication, follow-up appointments, labs, shipping, and support."
                },
                {
                    question: "How does the payment process work?",
                    answer: "Initial lab testing and doctor visit: $95. Monthly treatment: $199/month. Your initial $95 payment applies to your first month's cost, so if prescribed, you will only be billed $9 for your first month of treatment. After your first month, you will be billed $199/month for as long as you are prescribed treatment and choose to continue."
                },
                {
                    question: "How do I take Enclomiphene?",
                    answer: "Enclomiphene is typically taken once daily as an oral pill. Your doctor will prescribe the specific dosage and timing based on your individual needs and lab results."
                },
                {
                    question: "When can I expect to see results?",
                    answer: "Individual results vary, but many patients may see improvements in energy, mood, and other symptoms within 4-8 weeks of starting treatment. Testosterone levels typically improve within 2-4 weeks."
                },
                {
                    question: "What are the side effects of Enclomiphene?",
                    answer: "Side effects are generally mild and may include headache, nausea, or visual disturbances. Unlike traditional TRT, Enclomiphene doesn't suppress natural testosterone production. If you experience any side effects, contact your doctor immediately."
                },
                {
                    question: "Who should take Enclomiphene?",
                    answer: "Enclomiphene is designed for men seeking to naturally optimize their testosterone levels. It's particularly beneficial for those experiencing symptoms of low testosterone like fatigue, decreased libido, or reduced motivation while maintaining their body's natural hormone production."
                },
                {
                    question: "Do you accept insurance?",
                    answer: "No, we do not accept insurance. We are a cash-based practice."
                }
            ],
            combination: [
                {
                    question: "What's the cost and what's included?",
                    answer: "Treatment starts with a one-time payment of $95 for initial lab work and consultation. This payment is applied to your first month's cost, if prescribed. Monthly treatment is $125/first month and includes both medications, follow-up appointments, labs, shipping, and support."
                },
                {
                    question: "How does the payment process work?",
                    answer: "Initial lab testing and doctor visit: $95. Monthly treatment: $220/month. Your initial $95 payment applies to your first month's cost, so if prescribed, you will only be billed $30 for your first month of treatment. After your first month, you will be billed $220/month for as long as you are prescribed treatment and choose to continue."
                },
                {
                    question: "How do I take this combination therapy?",
                    answer: "Enclomiphene is typically taken once daily, while Tadalafil can be taken daily or as needed based on your doctor's recommendation. Your physician will provide specific instructions for both medications."
                },
                {
                    question: "When can I expect to see results?",
                    answer: "You may notice improvements in sexual function within days to weeks with Tadalafil, while testosterone optimization from Enclomiphene typically shows results within 4-8 weeks. Individual results vary."
                },
                {
                    question: "What are the side effects of this combination?",
                    answer: "Enclomiphene side effects may include headache, nausea, or visual disturbances. Tadalafil side effects may include headache, back pain, or flushing. Both medications are generally well tolerated. If you experience any side effects, contact your doctor immediately."
                },
                {
                    question: "Who should take this combination therapy?",
                    answer: "This combination is designed for men experiencing both low testosterone symptoms and erectile function challenges. It naturally optimizes testosterone while addressing sexual performance concerns."
                },
                {
                    question: "Can I take Tadalafil with other medications?",
                    answer: "Tadalafil can interact with certain medications, especially nitrates and some blood pressure medications. Always inform your doctor of all medications you're taking during your consultation."
                },
                {
                    question: "Do you accept insurance?",
                    answer: "No, we do not accept insurance. We are a cash-based practice."
                }
            ]
        };

        // Return specific FAQ data based on product type
        return faqData[productType] || faqData.enclomiphene;
    }

    updateFAQs() {
        // Determine product type based on answer to question 3
        const question3Answer = this.answers[3]?.toLowerCase() || '';
        let productType = 'enclomiphene'; // default
        
        if (question3Answer.includes('yes')) {
            productType = 'combination';
        } else if (question3Answer.includes('no')) {
            productType = 'enclomiphene';
        }
        
        // Get FAQ data for this product type
        const faqData = this.getFAQData(productType);
        
        // Update the FAQ list in the DOM
        const faqList = document.querySelector('.faq-list');
        if (!faqList) return;
        
        // Clear existing FAQs
        faqList.innerHTML = '';
        
        // Create new FAQ items
        faqData.forEach((faq, index) => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <button class="faq-question" aria-expanded="false">
                    <span class="faq-question-text">${faq.question}</span>
                    <span class="faq-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </button>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        <p>${faq.answer}</p>
                    </div>
                </div>
            `;
            faqList.appendChild(faqItem);
        });
        
        // Re-initialize FAQ click handlers for the new FAQ items
        initializeFAQ();
    }

    updateComparisonChart() {
        const question3Answer = this.answers[3]?.toLowerCase() || '';
        const comparisonImage = document.querySelector('.comparison-image');
        const comparisonHeader = document.querySelector('.comparison-header');
        const comparisonDescription = document.querySelector('.comparison-description');
        const comparisonImageContainer = document.querySelector('.comparison-image-container');
        const comparisonCtaBtn = document.getElementById('comparison-cta-btn');
        
        if (!comparisonImageContainer) return;
        
        // Reset to original content for enclomiphene products
        if (comparisonHeader) {
            comparisonHeader.textContent = "Stop Throwing Money at Symptoms. Start Investing in the Foundation.";
        }
        if (comparisonDescription) {
            comparisonDescription.textContent = "You're already spending hundreds on your health every month, but you're treating symptoms instead of the root cause. Hormone optimization isn't another expense—it's the multiplier that makes everything else actually work.";
        }
        if (comparisonCtaBtn) {
            comparisonCtaBtn.textContent = "START MY TREATMENT";
        }
        
        // Use specific comparison image based on product
        if (comparisonImage) {
            if (question3Answer.includes('yes')) {
                comparisonImage.src = 'assets/e+t comparison (1).png';
                comparisonImage.alt = 'Investment comparison showing current spending vs Enclomiphene + Tadalafil';
            } else {
                comparisonImage.src = 'assets/enclo comparison.png';
                comparisonImage.alt = 'Investment comparison showing current spending vs Enclomiphene';
            }
        } else {
            // Restore original single image structure if it was replaced
            comparisonImageContainer.innerHTML = `
                <img src="assets/enclo comparison.png" alt="Investment comparison showing current spending vs Enclomiphene" class="comparison-image">
            `;
        }
    }
}

// Testimonials Carousel functionality
class TestimonialsCarousel {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 4;
        this.isScrolling = false;
        this.autoScrollInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const dots = document.querySelectorAll('.dot');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Handle touch events for mobile swipe
        this.bindTouchEvents();
    }

    bindTouchEvents() {
        const track = document.querySelector('.testimonials-track');
        if (!track) return;

        let startX = 0;
        let endX = 0;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        track.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
        });

        track.addEventListener('touchend', () => {
            const threshold = 50; // Minimum swipe distance
            const diff = startX - endX;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextSlide(); // Swipe left - go to next
                } else {
                    this.prevSlide(); // Swipe right - go to previous
                }
            }
        });
    }

    nextSlide() {
        if (this.isScrolling) return;
        
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }

    prevSlide() {
        if (this.isScrolling) return;
        
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.updateCarousel();
    }

    goToSlide(slideIndex) {
        if (this.isScrolling || slideIndex === this.currentSlide) return;
        
        this.currentSlide = slideIndex;
        this.updateCarousel();
    }

    updateCarousel() {
        const track = document.querySelector('.testimonials-track');
        const dots = document.querySelectorAll('.dot');
        
        if (!track) return;

        this.isScrolling = true;

        // Calculate the transform value
        // Each card is 928px wide + 2rem gap (32px) = 960px total
        const cardWidth = 928;
        const gap = 32;
        const slideWidth = cardWidth + gap;
        const translateX = -this.currentSlide * slideWidth;

        // Apply smooth transform
        track.style.transform = `translateX(${translateX}px)`;

        // Update active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        // Reset scrolling flag after animation completes
        setTimeout(() => {
            this.isScrolling = false;
        }, 500);
    }
}

// Pricing Modal functionality
class PricingModal {
    constructor() {
        this.modal = document.getElementById('pricing-modal');
        this.closeBtn = document.getElementById('modal-close-btn');
        this.overlay = document.querySelector('.modal-overlay');
        this.moreInfoLink = document.querySelector('.more-info-link');
        this.quiz = null; // Will be set when TRTQuiz creates this modal
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Open modal when "More info on pricing" link is clicked
        if (this.moreInfoLink) {
            this.moreInfoLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }

        // Close modal when close button is clicked
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal when overlay is clicked
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal when Escape key is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal() {
        // Update modal content based on current product
        this.updateModalContent();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    updateModalContent() {
        // Get current product type from the quiz answers
        let productType = 'enclomiphene'; // default
        
        if (this.quiz && this.quiz.answers[3]) {
            const question3Answer = this.quiz.answers[3].toLowerCase();
            if (question3Answer.includes('yes')) {
                productType = 'combination';
            } else if (question3Answer.includes('no')) {
                productType = 'enclomiphene';
            }
        }

        // Get pricing content based on product type
        const pricingContent = this.getPricingContent(productType);
        
        // Update modal content
        this.updateModalHTML(pricingContent);
    }

    getPricingContent(productType) {
        const content = {
            enclomiphene: {
                title: 'Enclomiphene Pricing Details',
                section1: {
                    title: 'What you pay today: $95',
                    description: "This is the cost of your baseline lab test and first visit with one of our doctors. If prescribed treatment, this $95 will be applied to your first month's cost of treatment. This is a one-time, non-recurring payment."
                },
                section2: {
                    title: 'What you pay if prescribed: $104/first month | $199/month after',
                    description: 'If prescribed treatment after completing labs and meeting with one of our doctors, your first month treatment cost for Enclomiphene will be $104. All following months of treatment will be billed at $199/month.'
                },
                section3: {
                    title: 'Cancellation & Payment Terms',
                    list: [
                        'Cancel anytime',
                        'No hidden fees or contractual obligations',
                        'Month-to-month payments'
                    ]
                }
            },
            combination: {
                title: 'Enclomiphene + Tadalafil Pricing Details',
                section1: {
                    title: 'What you pay today: $95',
                    description: "This is the cost of your baseline lab test and first visit with one of our doctors. If prescribed treatment, this $95 will be applied to your first month's cost of treatment. This is a one-time, non-recurring payment."
                },
                section2: {
                    title: 'What you pay if prescribed: $125/first month | $220/month after',
                    description: 'If prescribed treatment after completing labs and meeting with one of our doctors, your first month treatment cost for combination therapy will be $125. All following months of treatment will be billed at $220/month.'
                },
                section3: {
                    title: 'Cancellation & Payment Terms',
                    list: [
                        'Cancel anytime',
                        'No hidden fees or contractual obligations',
                        'Month-to-month payments'
                    ]
                }
            }
        };

        return content[productType] || content.enclomiphene;
    }

    updateModalHTML(content) {
        const modalTitle = this.modal.querySelector('.modal-title');
        const modalBody = this.modal.querySelector('.modal-body');

        // Update title
        modalTitle.textContent = content.title;

        // Update body content
        modalBody.innerHTML = `
            <div class="pricing-detail-section">
                <h3 class="pricing-detail-title">${content.section1.title}</h3>
                <p class="pricing-detail-description">${content.section1.description}</p>
            </div>
            
            <div class="pricing-detail-section">
                <h3 class="pricing-detail-title">${content.section2.title}</h3>
                <p class="pricing-detail-description">${content.section2.description}</p>
            </div>
            
            <div class="pricing-detail-section">
                <h3 class="pricing-detail-title">${content.section3.title}</h3>
                <ul class="pricing-detail-list">
                    ${content.section3.list.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    setQuiz(quiz) {
        this.quiz = quiz;
    }
}

// Standalone FAQ functionality for immediate use
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach((question, index) => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const faqAnswer = faqItem.querySelector('.faq-answer');
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    const otherItem = otherQuestion.closest('.faq-item');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    otherAnswer.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isExpanded) {
                question.setAttribute('aria-expanded', 'false');
                faqAnswer.classList.remove('active');
            } else {
                question.setAttribute('aria-expanded', 'true');
                faqAnswer.classList.add('active');
            }
        });
    });
}

// Facebook Pixel Event Tracking
class FacebookPixelTracker {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.bindCTAEvents();
            });
        } else {
            this.bindCTAEvents();
        }
    }

    bindCTAEvents() {
        // The Tellescope form URL for all CTA buttons
        const tellescapeFormUrl = 'https://business.tellescope.com/e/public/form?f=68279be5ed24a991a4220f2e&businessId=67ab79f02cadd94416b434bb&nextFormId=&publicIdentifier=&customTypeId=&orgIds=&skipMatch=false&autoStart=false&sessionId=&';
        
        // Track "BUY NOW" button clicks and redirect
        const buyNowBtn = document.getElementById('buy-now-btn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                this.trackCTAClick('BuyNow', 'buy-now-button');
                // Redirect to Tellescope form
                window.open(tellescapeFormUrl, '_blank');
            });
        }

        // Track "START MY TREATMENT" button clicks and redirect
        const startTreatmentBtn = document.getElementById('comparison-cta-btn');
        if (startTreatmentBtn) {
            startTreatmentBtn.addEventListener('click', () => {
                this.trackCTAClick('StartTreatment', 'start-treatment-button');
                // Redirect to Tellescope form
                window.open(tellescapeFormUrl, '_blank');
            });
        }

        // Track form submission as Lead event
        const contactForm = document.getElementById('contact-form-element');
        if (contactForm) {
            contactForm.addEventListener('submit', () => {
                this.trackFormSubmission();
            });
        }
    }

    trackCTAClick(eventName, buttonId) {
        // Check if fbq is available (Meta Pixel loaded)
        if (typeof fbq !== 'undefined') {
            // Track as Lead event (standard Facebook event)
            fbq('track', 'Lead', {
                content_name: eventName,
                content_category: 'Enclomiphene_CTA',
                source: buttonId,
                value: 95.00, // Initial consultation value
                currency: 'USD'
            });

            // Also track as custom event for more granular tracking
            fbq('trackCustom', eventName, {
                button_id: buttonId,
                page_section: this.getPageSection(buttonId),
                timestamp: new Date().toISOString()
            });

            console.log(`Facebook Pixel: Tracked ${eventName} click`);
        } else {
            console.warn('Facebook Pixel not loaded - unable to track event');
        }
    }

    trackFormSubmission() {
        if (typeof fbq !== 'undefined') {
            // Track form submission as Lead event
            fbq('track', 'Lead', {
                content_name: 'ContactFormSubmission',
                content_category: 'Enclomiphene_Lead',
                source: 'contact-form',
                value: 95.00,
                currency: 'USD'
            });

            // Custom event for form submission
            fbq('trackCustom', 'FormSubmission', {
                form_type: 'contact_form',
                lead_type: 'enclomiphene_consultation',
                timestamp: new Date().toISOString()
            });

            console.log('Facebook Pixel: Tracked form submission');
        }
    }

    getPageSection(buttonId) {
        switch(buttonId) {
            case 'buy-now-button':
                return 'recommendation_section';
            case 'start-treatment-button':
                return 'comparison_section';
            default:
                return 'unknown';
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize existing functionality
    window.quiz = new TRTQuiz();
    window.carousel = new TestimonialsCarousel();
    window.pricingModal = new PricingModal();
    window.pricingModal.setQuiz(window.quiz);
    
    // Initialize Facebook Pixel tracking
    window.facebookTracker = new FacebookPixelTracker();
    
    initializeFAQ();
});

// Add selected state styles
const style = document.createElement('style');
style.textContent = `
    .answer-btn.selected {
        background-color: #7A5420;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(144, 99, 35, 0.4);
    }
`;
document.head.appendChild(style); 