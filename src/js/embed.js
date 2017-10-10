// Locate divs for the player and unavailable panel,
// and get the embed version of the url
var player = document.getElementById('player-api'),
    unavailable = document.getElementById('player-unavailable'),
    url = location.href.replace(/watch\?v=([\w-]+)(?:&.*)?$/, 'embed/$1');

if (player) {
  // Replace the player with an iframe that uses the embed url
  player.innerHTML =
    '<iframe width="100%" height="100%" src="' + url +
    '?autoplay=1" frameborder="0" allowfullscreen></iframe>';

  // Remove CSS that's hiding the player
  player.classList.remove('off-screen-target');

  // Delete the unavailable panel
  if (unavailable) {
    unavailable.outerHTML = '';
  }
} else {
  // Fallback - redirect directly to the embed if the divs aren't found
  location.href = url;
}
