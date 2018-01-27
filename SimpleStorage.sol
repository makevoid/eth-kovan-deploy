contract SimpleStorage {
  bytes32 public data;

  function set(bytes32 _data) {
    data = _data;
  }
}
