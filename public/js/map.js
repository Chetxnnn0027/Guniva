if (
  typeof mapToken !== "undefined" &&
  mapToken &&
  typeof listing !== "undefined" &&
  listing.geometry &&
  Array.isArray(listing.geometry.coordinates) &&
  listing.geometry.coordinates.length === 2
) {
  mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
    container: "map",
    center: listing.geometry.coordinates,
    zoom: 9
  });

  map.addControl(new mapboxgl.NavigationControl());

  const popupContent = document.createElement("div");
  const titleEl = document.createElement("h6");
  titleEl.style.fontWeight = "700";
  titleEl.style.margin = "0 0 4px 0";
  titleEl.textContent = listing.title || "Listing Location";

  const noteEl = document.createElement("p");
  noteEl.style.margin = "0";
  noteEl.style.fontSize = "0.85rem";
  noteEl.style.color = "#64748B";
  noteEl.textContent = "Exact location will be provided after booking.";

  popupContent.appendChild(titleEl);
  popupContent.appendChild(noteEl);

  new mapboxgl.Marker({ color: "#FE424D" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
    .addTo(map);
}
