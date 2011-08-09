function Set(init) {
  this.elems = {};

  this.initialize = function(vals) {
    if (vals) {
      var l = vals.length;
      for (var i=0; i<l; i++) {
        this.elems[vals[i]] = true;
      }
      return l;
    } 
  };

  this.add = function(elem) {
    return this.elems[elem] = true;
  };

  this.remove = function(elem) {
    if (elem in this.elems) {
      return delete(this.elems[elem]);
    } else {
      return false;
    }
  };

  this.elements = function() {
    var result = [];
    for (var elem in this.elems) {
      result.push(elem);
    }
    return result;
  }

  this.initialize(init);
  return this;
};

exports.Set = Set;
