export default function markerIsEqual(a, b) {
  return (
    a.getPosition().lat() === b.getPosition().lat() &&
    a.getPosition().lng() === b.getPosition().lng()
  );
}
