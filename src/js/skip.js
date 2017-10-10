// Function that sets MutationObservers to automatically close banner ads
// and automatically skip pre-roll ads.
// Sets a MutationObserver on div.ad-container that looks for ads appearing.
// This triggers attemptToSkip():
// If a banner ad is detected, its close button will be clicked immediately.
// If a pre-roll ad is detected, a MutationObserver will be set that looks
// for the skip button made visible and ready to click, before clicking it.
function adSkipper() {
  'use strict';
  // Need the video element to get current time
  // Ads appear within div.video-ads
  var video = document.getElementsByTagName('video')[0],
      ads = document.getElementsByClassName('video-ads')[0];

  // Function that attempts to immediately close banner ads if detected,
  // and sets a MutationObserver for skippable pre-roll ads if detected.
  function onAdDetected() {
    // Function that attempts to click the skip button of a pre-roll ad
    // and disconnects the skipObserver if successful.
    function onCanSkip() {
      // Only click skip if ctrl is not being held
      if (!ctrl) {
        skip.click();
      }
      // Can disconnect skip observer only if the skip was succesful
      // i.e if the skip button is no longer found
      if (!ads.getElementsByClassName('videoAdUiSkipButton')[0]) {
        adSkipper.skipObserver.disconnect();
      }
    }

    // Close banner ads by finding and the close button
    var close = ads.getElementsByClassName('close-button')[0];
    if (close) {
      close.click();
    }

    // Skip preroll ads when skip button changes
    var skip = ads.getElementsByClassName('videoAdUiSkipButton')[0];
    if (skip) {
      if (adSkipper.skipObserver === undefined) {
        adSkipper.skipObserver = new MutationObserver(onCanSkip);
      } else {
        // Disconnect any pre-existing skip observers that were missed from previous ads
        adSkipper.skipObserver.disconnect();
      }
      // Observe div.videoAdUiSkipContainer for it becoming visible
      adSkipper.skipObserver.observe(ads.getElementsByClassName('videoAdUiSkipContainer')[0], {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    } else {
      // Non-skippable pre-roll ad
      // Cut off source to skip it
      if (ads.getElementsByClassName('videoAdUi').length > 0) {
        video.src = '';
      }
    }
    // Don't disconnect adObserver as multiple ads can appear per video
  }

  if (ads) {
    // Attempt to skip ads immediately, in case any ads are already present.
    onAdDetected();

    // Use a mutation observer to detect when an ad has popped up in div.ad-container
    // and run a function that attempts to skip/close the ad
    if (adSkipper.adObserver === undefined) {
      adSkipper.adObserver = new MutationObserver(onAdDetected);
    } else {
      // Disconnect any pre-existing ad observers that were missed from previous ads
      adSkipper.adObserver.disconnect();
    }
    // Observe div.ad-container for any children popping up
    adSkipper.adObserver.observe(ads.getElementsByClassName('ad-container')[0], {
      childList: true
    });
  }
}


// Function that looks for and hides other ads on the page
function adHider() {
  'use strict';
  document.querySelectorAll('#watch7-sidebar-ads, .ad-div')
          .forEach(function (ad) {
    ad.style.display = 'none';
  });
  var prem = document.getElementById('premium-yva-close');
  if (prem) {
    prem.click();
  }
}


// Due to YouTube pushing states and doing other unusual things when moving between videos
// and the home page, it's more complicated than simply running the adSkipper on page load.
// First, the DOM has to be loaded, allowing us to observe document.body.
// Then, we can observe body for YouTube's page-loaded class being added.
// Then, we can run adSkipper.
// However, we want to avoid running adSkipper multiple times, so the appearance of
// .page-loaded is tracked and adSkipper is only run when the body gains this class.
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  // Function to be run when the page has loaded
  function onPageLoad() {
    // Ready to run adSkipper
    adSkipper();
    // Also hide other ads
    adHider();
  }

  // Was the page-loaded class present last time we checked
  var pageLoadedAlready = false;

  // Function to be run when the body's classes change.
  function onBodyClassChange() {
    var pageLoadedNow = document.body.classList.contains('page-loaded');
    if (!pageLoadedAlready && pageLoadedNow) {
      // If page previously had no .page-loaded, and now it does
      onPageLoad();
    }
    // Update whether body has .page-loaded or not
    pageLoadedAlready = pageLoadedNow;
    // Keep load observer connected, since if no ads were found,
    // adSkipper will exit without setting any MutationObservers
    // but ads may still appear later
  }

  // Observe the body for classes being added
  var loadObserver = new MutationObserver(onBodyClassChange);
  loadObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
});

// Track whether Ctrl is pressed
var ctrl = false;

document.addEventListener('keydown', function (e) {
  if (e.keyCode === 17) {
    ctrl = true;
  }
});

document.addEventListener('keyup', function (e) {
  if (e.keyCode === 17) {
    ctrl = false;
  }
});
