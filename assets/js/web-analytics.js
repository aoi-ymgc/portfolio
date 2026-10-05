(() => {
  if (
    location.protocol !== "https:" ||
    location.hostname !== "aoi-ymgc.github.io" ||
    !location.pathname.startsWith("/portfolio/") ||
    document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]')
  ) {
    return;
  }

  // The token is a public site identifier from Cloudflare's installation snippet.
  const beacon = document.createElement("script");
  beacon.type = "module";
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.dataset.cfBeacon = JSON.stringify({ token: "869c5d97be9d4b6591fd8f807204653f" });
  document.body.appendChild(beacon);
})();
