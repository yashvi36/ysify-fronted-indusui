AOS.init({
    duration: 800,
    easing: 'slide'
});

(function ($) {
    "use strict";

    /* ===============================
       FULL HEIGHT (DESKTOP ONLY)
    =============================== */
    var fullHeight = function () {
        if ($(window).width() > 768) {
            $('.js-fullheight').css('height', $(window).height());
        } else {
            $('.js-fullheight').css('height', 'auto');
        }
    };
    fullHeight();

    $(window).on('resize', function () {
        if ($(window).width() > 768) {
            $('.js-fullheight').css('height', $(window).height());
        }
    });


    let slides = document.querySelectorAll('.slide');
    let index = 0;

    setInterval(() => {
        slides[index].classList.remove('active');
        index = (index + 1) % slides.length;
        slides[index].classList.add('active');
    }, 5000);

    /* ===============================
       PARALLAX (DESKTOP ONLY)
    =============================== */
    if ($(window).width() > 768) {
        $(window).stellar({
            responsive: true,
            parallaxBackgrounds: true,
            parallaxElements: true,
            horizontalScrolling: false
        });

        $.Scrollax();
    }

    /* ===============================
       LOADER
    =============================== */
    var loader = function () {
        setTimeout(function () {
            if ($('#ftco-loader').length > 0) {
                $('#ftco-loader').removeClass('show');
            }
        }, 1);
    };
    loader();

    /* ===============================
       CAROUSELS
    =============================== */
    var carousel = function () {

        $('.home-slider').owlCarousel({
            loop: true,
            autoplay: true,
            margin: 0,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            nav: false,
            autoplayHoverPause: false,
            items: 1
        });

        $('.carousel-work').owlCarousel({
            autoplay: true,
            center: true,
            loop: true,
            items: 1,
            margin: 30,
            stagePadding: 0,
            nav: true,
            navText: [
                '<span class="ion-ios-arrow-back"></span>',
                '<span class="ion-ios-arrow-forward"></span>'
            ],
            responsive: {
                0: {
                    items: 1,
                    stagePadding: 0
                },
                600: {
                    items: 2,
                    stagePadding: 50
                },
                1000: {
                    items: 3,
                    stagePadding: 100
                }
            }
        });

    };
    carousel();

    /* ===============================
       NAVBAR DROPDOWN (DESKTOP ONLY)
    =============================== */
    if ($(window).width() > 991) {
        $('nav .dropdown').hover(
            function () {
                $(this).addClass('show');
                $(this).find('> a').attr('aria-expanded', true);
                $(this).find('.dropdown-menu').addClass('show');
            },
            function () {
                $(this).removeClass('show');
                $(this).find('> a').attr('aria-expanded', false);
                $(this).find('.dropdown-menu').removeClass('show');
            }
        );
    }

    /* ===============================
       NAVBAR SCROLL EFFECT
    =============================== */
    var scrollWindow = function () {
        $(window).scroll(function () {
            var st = $(this).scrollTop(),
                navbar = $('.ftco_navbar');

            if (st > 150) {
                navbar.addClass('scrolled');
            } else {
                navbar.removeClass('scrolled sleep');
            }

            if (st > 350) {
                navbar.addClass('awake');
            } else {
                navbar.removeClass('awake').addClass('sleep');
            }
        });
    };
    scrollWindow();

    /* ===============================
       COUNTER
    =============================== */
    var counter = function () {
        $('#section-counter').waypoint(function (direction) {
            if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                $('.number').each(function () {
                    var $this = $(this),
                        num = $this.data('number');
                    $this.animateNumber({ number: num }, 7000);
                });
            }
        }, { offset: '95%' });
    };
    counter();

    /* ===============================
       CONTENT ANIMATION
    =============================== */
    var contentWayPoint = function () {
        $('.ftco-animate').waypoint(function (direction) {
            if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
                $(this.element).addClass('fadeInUp ftco-animated');
            }
        }, { offset: '95%' });
    };
    contentWayPoint();

    /* ===============================
       ONE PAGE NAV (SAFE)
    =============================== */
    $(".smoothscroll[href^='#']").on('click', function (e) {
        e.preventDefault();
        var target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 600);
        }
    });

    /* ===============================
       POPUPS
    =============================== */
    $('.image-popup').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        fixedContentPos: true,
        gallery: { enabled: true },
        zoom: { enabled: true, duration: 300 }
    });

    $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false
    });

    /* ===============================
       DATE & TIME PICKERS
    =============================== */
    $('.appointment_date').datepicker({
        format: 'm/d/yyyy',
        autoclose: true
    });

    $('.appointment_time').timepicker();

})(jQuery);