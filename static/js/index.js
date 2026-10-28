// Use native streaming so playback can start before the full video downloads.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('#videos .teaser-player').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.teaser-loading');
    var status = player.querySelector('.teaser-loading-text');
    var progress = player.querySelector('progress');
    var action = player.querySelector('button');
    var failed = false;
    var needsPlay = false;
    var started = false;
    var playPending = false;
    var playAttempt = 0;

    function showLoading() {
      if (failed || needsPlay) return;
      overlay.hidden = false;
      player.setAttribute('aria-busy', 'true');
      updateProgress();
    }

    function updateProgress() {
      if (overlay.hidden || failed || needsPlay) return;
      var duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        progress.removeAttribute('value');
        status.textContent = 'Loading animation…';
        return;
      }
      // Buffered time is observable without a second request or a Blob download.
      var buffered = 0;
      for (var i = 0; i < video.buffered.length; i++) {
        buffered += video.buffered.end(i) - video.buffered.start(i);
      }
      var percent = Math.min(100, Math.max(0, Math.floor(buffered / duration * 100)));
      progress.value = percent;
      status.textContent = 'Loading animation… ' + percent + '% buffered';
    }

    function showAction(message, label) {
      overlay.hidden = false;
      player.setAttribute('aria-busy', 'false');
      status.textContent = message;
      progress.hidden = true;
      action.textContent = label;
      action.hidden = false;
    }

    function showError() {
      failed = true;
      showAction('Animation could not load.', 'Retry');
    }

    function tryPlay() {
      if (failed || playPending) return;
      playPending = true;
      var attempt = ++playAttempt;
      var promise = video.play();
      if (promise) {
        promise.then(function () {
          if (attempt !== playAttempt) return;
          playPending = false;
        }).catch(function (error) {
          if (attempt !== playAttempt) return;
          playPending = false;
          if (error.name === 'NotAllowedError') {
            needsPlay = true;
            showAction('Animation ready to play.', 'Play animation');
          } else if (error.name !== 'AbortError') {
            showError();
          }
        });
      } else {
        playPending = false;
      }
    }

    function onPlaying() {
      started = true;
      needsPlay = false;
      overlay.hidden = true;
      player.setAttribute('aria-busy', 'false');
    }

    ['loadedmetadata', 'loadeddata', 'progress', 'durationchange'].forEach(function (event) {
      video.addEventListener(event, updateProgress);
    });
    video.addEventListener('waiting', showLoading);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', function () {
      if (!started && !needsPlay) tryPlay();
    });
    video.addEventListener('error', showError);
    video.querySelector('source').addEventListener('error', showError);
    action.addEventListener('click', function () {
      var retry = failed;
      failed = false;
      needsPlay = false;
      action.hidden = true;
      progress.hidden = false;
      if (retry) {
        ++playAttempt;
        playPending = false;
        started = false;
        video.load();
      }
      showLoading();
      // Keep play() in the click handler for browsers that require a gesture.
      tryPlay();
    });

    // Account for cached media events that fired before this listener was bound.
    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      showError();
    } else if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      onPlaying();
    } else {
      showLoading();
      tryPlay();
    }
  });
});

window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    // This demo has no interpolation widget; avoid 240 unused image requests.
    if (document.getElementById('interpolation-image-wrapper')) {
      preloadInterpolationImages();
      $('#interpolation-slider').on('input', function(event) {
        setInterpolationImage(this.value);
      });
      setInterpolationImage(0);
      $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);
    }

    bulmaSlider.attach();

})
