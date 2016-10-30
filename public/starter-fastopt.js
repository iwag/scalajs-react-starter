(function(){
'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;

// Where to send exports
var $e =
  (typeof $env["exportsNamespace"] === "object" && $env["exportsNamespace"])
    ? $env["exportsNamespace"] : $g;
$env["exportsNamespace"] = $e;

// Freeze the environment info
$g["Object"]["freeze"]($env);

// Snapshots of builtins and polyfills





var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });



// Other fields
















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $checkNonNull = function(obj) {
  return obj !== null ? obj : $throwNullPointerException();
};

var $throwNullPointerException = function() {
  throw new $c_jl_NullPointerException().init___();
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        $throwNullPointerException();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $as_jl_Number(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;
  if (srcu !== destu || destPos < srcPos || srcPos + length < destPos) {
    for (var i = 0; i < length; i++)
      destu[destPos+i] = srcu[srcPos+i];
  } else {
    for (var i = length-1; i >= 0; i--)
      destu[destPos+i] = srcu[srcPos+i];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {
  return v !== v || $fround(v) === v;
};


var $asUnit = function(v) {
  if (v === void 0)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

/* We have to force a non-elidable *read* of $e, otherwise Closure will
 * eliminate it altogether, along with all the exports, which is ... er ...
 * plain wrong.
 */
this["__ScalaJSExportsNamespace"] = $e;

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;

  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(this.u.constructor(this.u));
  };

























  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

var $is_F0 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F0)))
});
var $as_F0 = (function(obj) {
  return (($is_F0(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function0"))
});
var $isArrayOf_F0 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F0)))
});
var $asArrayOf_F0 = (function(obj, depth) {
  return (($isArrayOf_F0(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function0;", depth))
});
var $is_F1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F1)))
});
var $as_F1 = (function(obj) {
  return (($is_F1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function1"))
});
var $isArrayOf_F1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F1)))
});
var $asArrayOf_F1 = (function(obj, depth) {
  return (($isArrayOf_F1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function1;", depth))
});
var $is_F2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F2)))
});
var $as_F2 = (function(obj) {
  return (($is_F2(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function2"))
});
var $isArrayOf_F2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F2)))
});
var $asArrayOf_F2 = (function(obj, depth) {
  return (($isArrayOf_F2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function2;", depth))
});
var $is_F3 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F3)))
});
var $as_F3 = (function(obj) {
  return (($is_F3(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function3"))
});
var $isArrayOf_F3 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F3)))
});
var $asArrayOf_F3 = (function(obj, depth) {
  return (($isArrayOf_F3(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function3;", depth))
});
var $is_Ljapgolly_scalajs_react_vdom_TagMod = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_TagMod)))
});
var $as_Ljapgolly_scalajs_react_vdom_TagMod = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_TagMod(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.TagMod"))
});
var $isArrayOf_Ljapgolly_scalajs_react_vdom_TagMod = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_TagMod)))
});
var $asArrayOf_Ljapgolly_scalajs_react_vdom_TagMod = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_TagMod(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.TagMod;", depth))
});
/** @constructor */
var $c_O = (function() {
  /*<skip>*/
});
/** @constructor */
var $h_O = (function() {
  /*<skip>*/
});
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x["toString"](16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype["toString"] = (function() {
  return this.toString__T()
});
var $is_O = (function(obj) {
  return (obj !== null)
});
var $as_O = (function(obj) {
  return obj
});
var $isArrayOf_O = (function(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase["isPrimitive"])))
  }
});
var $asArrayOf_O = (function(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
});
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
var $is_sc_GenTraversableOnce = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
});
var $as_sc_GenTraversableOnce = (function(obj) {
  return (($is_sc_GenTraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversableOnce"))
});
var $isArrayOf_sc_GenTraversableOnce = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
});
var $asArrayOf_sc_GenTraversableOnce = (function(obj, depth) {
  return (($isArrayOf_sc_GenTraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversableOnce;", depth))
});
/** @constructor */
var $c_Lexample_TimerExample$ = (function() {
  $c_O.call(this);
  this.tag$1 = null;
  this.tagList$1 = null;
  this.inputForm$1 = null;
  this.container$1 = null;
  this.contentsList$1 = null;
  this.initial$1 = null;
  this.Timer$1 = null
});
$c_Lexample_TimerExample$.prototype = new $h_O();
$c_Lexample_TimerExample$.prototype.constructor = $c_Lexample_TimerExample$;
/** @constructor */
var $h_Lexample_TimerExample$ = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$.prototype = $c_Lexample_TimerExample$.prototype;
$c_Lexample_TimerExample$.prototype.init___ = (function() {
  $n_Lexample_TimerExample$ = this;
  this.tag$1 = $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps($m_Ljapgolly_scalajs_react_ReactComponentB$().defaultDomTypeAndProps__Ljapgolly_scalajs_react_ReactComponentB$PSBN__Ljapgolly_scalajs_react_ReactComponentB$Builder(new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("tag").render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$1$2) {
    $as_Lexample_TimerExample$Tag(x$1$2);
    $m_Ljapgolly_scalajs_react_vdom_package$all$();
    var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
    $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
    $m_Ljapgolly_scalajs_react_vdom_package$all$();
    var av = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
    var t = jsx$1.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("ui small basic button", av)]));
    return t.render__Ljapgolly_scalajs_react_ReactElement()
  })))).build__O());
  this.tagList$1 = new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("tags");
  this.inputForm$1 = $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps($m_Ljapgolly_scalajs_react_ReactComponentB$().defaultDomTypeAndProps__Ljapgolly_scalajs_react_ReactComponentB$PSBN__Ljapgolly_scalajs_react_ReactComponentB$Builder(new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("input").render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_Lexample_TimerExample$$anonfun$2().init___())).build__O());
  this.container$1 = $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps($m_Ljapgolly_scalajs_react_ReactComponentB$().defaultDomTypeAndProps__Ljapgolly_scalajs_react_ReactComponentB$PSBN__Ljapgolly_scalajs_react_ReactComponentB$Builder(new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("picture").render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_Lexample_TimerExample$$anonfun$3().init___())).build__O());
  this.contentsList$1 = $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps($m_Ljapgolly_scalajs_react_ReactComponentB$().defaultDomTypeAndProps__Ljapgolly_scalajs_react_ReactComponentB$PSBN__Ljapgolly_scalajs_react_ReactComponentB$Builder(new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("contentsList").render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_Lexample_TimerExample$$anonfun$4().init___())).build__O());
  this.initial$1 = $m_sci_Nil$();
  var c = new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("Timer").initialState__F0__Ljapgolly_scalajs_react_ReactComponentB$PS(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function() {
    var this$10 = $m_Lexample_TimerExample$();
    return new $c_Lexample_TimerExample$State().init___sci_List__T(this$10.initial$1, "")
  }))).backend__F1__Ljapgolly_scalajs_react_ReactComponentB$PSB(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$5$2) {
    return new $c_Lexample_TimerExample$Backend().init___Ljapgolly_scalajs_react_BackendScope(x$5$2)
  }))).render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_Lexample_TimerExample$$anonfun$16().init___());
  var this$13 = c.domType__Ljapgolly_scalajs_react_ReactComponentB().componentDidMount__F1__Ljapgolly_scalajs_react_ReactComponentB(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$6$2) {
    $as_Lexample_TimerExample$Backend(x$6$2["backend"]).start__V()
  }))).componentWillUnmount__F1__Ljapgolly_scalajs_react_ReactComponentB(new $c_Lexample_TimerExample$$anonfun$18().init___());
  var ev = $m_s_Predef$().scala$Predef$$singleton$und$eq$colon$eq$f;
  this.Timer$1 = $as_Ljapgolly_scalajs_react_ReactComponentC$ConstProps(this$13.propsUnit__s_Predef$$eq$colon$eq__Ljapgolly_scalajs_react_ReactComponentB$Builder(ev).build__O());
  return this
});
var $d_Lexample_TimerExample$ = new $TypeData().initClass({
  Lexample_TimerExample$: 0
}, false, "example.TimerExample$", {
  Lexample_TimerExample$: 1,
  O: 1
});
$c_Lexample_TimerExample$.prototype.$classData = $d_Lexample_TimerExample$;
var $n_Lexample_TimerExample$ = (void 0);
var $m_Lexample_TimerExample$ = (function() {
  if ((!$n_Lexample_TimerExample$)) {
    $n_Lexample_TimerExample$ = new $c_Lexample_TimerExample$().init___()
  };
  return $n_Lexample_TimerExample$
});
/** @constructor */
var $c_Lexample_TimerExample$Backend = (function() {
  $c_O.call(this);
  this.example$TimerExample$Backend$$$$f = null;
  this.interval$1 = null;
  this.intervalSec$1 = 0;
  this.delayMin$1 = 0;
  this.services$1 = null
});
$c_Lexample_TimerExample$Backend.prototype = new $h_O();
$c_Lexample_TimerExample$Backend.prototype.constructor = $c_Lexample_TimerExample$Backend;
/** @constructor */
var $h_Lexample_TimerExample$Backend = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$Backend.prototype = $c_Lexample_TimerExample$Backend.prototype;
$c_Lexample_TimerExample$Backend.prototype.init___Ljapgolly_scalajs_react_BackendScope = (function($$) {
  this.example$TimerExample$Backend$$$$f = $$;
  this.interval$1 = (void 0);
  this.intervalSec$1 = 60;
  this.delayMin$1 = 5;
  $m_sci_List$();
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array(["contentId", "title", "description", "tags", "thumbnailUrl", "viewCounter", "categoryTags", "startTime"]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  var jsx$3 = new $c_T3().init___O__O__O("video", $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf)), "startTime");
  $m_sci_List$();
  var xs$1 = new $c_sjs_js_WrappedArray().init___sjs_js_Array(["contentId", "title", "description", "tags", "startTime"]);
  var this$4 = $m_sci_List$();
  var cbf$1 = this$4.ReusableCBFInstance$2;
  var jsx$2 = new $c_T3().init___O__O__O("news", $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$1, cbf$1)), "lastCommentTime");
  $m_sci_List$();
  var xs$2 = new $c_sjs_js_WrappedArray().init___sjs_js_Array(["contentId", "title", "description", "tags", "thumbnailUrl", "viewCounter", "startTime"]);
  var this$6 = $m_sci_List$();
  var cbf$2 = this$6.ReusableCBFInstance$2;
  var jsx$1 = new $c_T3().init___O__O__O("illust", $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$2, cbf$2)), "startTime");
  $m_sci_List$();
  var xs$3 = new $c_sjs_js_WrappedArray().init___sjs_js_Array(["contentId", "title", "description", "tags", "communityIcon", "thumbnailUrl", "viewCounter", "categoryTags", "start_time", "community_level"]);
  var this$8 = $m_sci_List$();
  var cbf$3 = this$8.ReusableCBFInstance$2;
  var xs$4 = new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$3, jsx$2, jsx$1, new $c_T3().init___O__O__O("live", $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$3, cbf$3)), "startTime")]);
  var this$10 = $m_sci_List$();
  var cbf$4 = this$10.ReusableCBFInstance$2;
  var this$12 = $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs$4, cbf$4));
  var f = (function(i$2) {
    var i = $as_T3(i$2);
    return new $c_T3().init___O__O__O(i.$$und1$1, i.$$und2$1, i.$$und3$1)
  });
  var this$11 = $m_sci_List$();
  var bf = this$11.ReusableCBFInstance$2;
  if ((bf === $m_sci_List$().ReusableCBFInstance$2)) {
    if ((this$12 === $m_sci_Nil$())) {
      var jsx$4 = $m_sci_Nil$()
    } else {
      var arg1 = this$12.head__O();
      var h = new $c_sci_$colon$colon().init___O__sci_List(f(arg1), $m_sci_Nil$());
      var t = h;
      var rest = this$12.tail__sci_List();
      while ((rest !== $m_sci_Nil$())) {
        var arg1$1 = rest.head__O();
        var nx = new $c_sci_$colon$colon().init___O__sci_List(f(arg1$1), $m_sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$13 = rest;
        rest = this$13.tail__sci_List()
      };
      var jsx$4 = h
    }
  } else {
    var b = $s_sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder(this$12, bf);
    var these = this$12;
    while ((!these.isEmpty__Z())) {
      var arg1$2 = these.head__O();
      b.$$plus$eq__O__scm_Builder(f(arg1$2));
      var this$14 = these;
      these = this$14.tail__sci_List()
    };
    var jsx$4 = b.result__O()
  };
  this.services$1 = $as_sci_List(jsx$4);
  return this
});
$c_Lexample_TimerExample$Backend.prototype.changeText__Ljapgolly_scalajs_react_SyntheticEvent__V = (function(e) {
  $m_Ljapgolly_scalajs_react_package$();
  var qual$3 = this.example$TimerExample$Backend$$$$f;
  var C = $m_Ljapgolly_scalajs_react_CompStateAccess$SS$();
  var arg1 = C.state__Ljapgolly_scalajs_react_ComponentScope$undSS__O(qual$3);
  var s = $as_Lexample_TimerExample$State(arg1);
  var s$1 = new $c_Lexample_TimerExample$State().init___sci_List__T(s.contents$1, $as_T(e["target"]["value"]));
  C.setState__Ljapgolly_scalajs_react_ComponentScope$undSS__O__sjs_js_UndefOr__V(qual$3, s$1, (void 0))
});
$c_Lexample_TimerExample$Backend.prototype.start__V = (function() {
  this.interval$1 = $m_sjs_js_timers_package$().setInterval__D__F0__sjs_js_timers_SetIntervalHandle($imul(1000, this.intervalSec$1), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(arg$outer) {
    return (function() {
      arg$outer.doGetJsonV2__V()
    })
  })(this)));
  this.doGetJsonV2__V()
});
$c_Lexample_TimerExample$Backend.prototype.example$TimerExample$Backend$$params$1__sci_List__T__T = (function(j, sort) {
  var jsx$5 = new $c_T2().init___O__O("q", "%E3%80%81%20or%20%E3%80%82%20or%20%E3%81%AF%20or%20%E3%81%8C%20or%20%E3%81%AE");
  var jsx$4 = new $c_T2().init___O__O("targets", "title,description,tags");
  var y = $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(j, "", ",", "");
  var jsx$3 = new $c_T2().init___O__O("fields", y);
  var y$1 = ("-" + sort);
  var array = [jsx$5, jsx$4, jsx$3, new $c_T2().init___O__O("_sort", y$1), new $c_T2().init___O__O("_limit", "10"), new $c_T2().init___O__O("_offset", "0"), new $c_T2().init___O__O("_context", "github.com/iwag")];
  var this$16 = new $c_scm_MapBuilder().init___sc_GenMap($m_sci_Map$EmptyMap$());
  matchEnd4: {
    var i = 0;
    var len = $uI(array["length"]);
    while ((i < len)) {
      var index = i;
      var arg1 = array[index];
      this$16.$$plus$eq__T2__scm_MapBuilder($as_T2(arg1));
      i = ((1 + i) | 0)
    };
    break matchEnd4
  };
  var jsx$2 = $as_sc_TraversableLike(this$16.elems$1);
  var jsx$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(i$2) {
    var i$1 = $as_T2(i$2);
    return (($as_T(i$1.$$und1$f) + "=") + i$1.$$und2$f)
  }));
  var this$17 = $m_sci_Iterable$();
  return $as_sc_TraversableOnce(jsx$2.map__F1__scg_CanBuildFrom__O(jsx$1, this$17.ReusableCBFInstance$2)).mkString__T__T("&")
});
$c_Lexample_TimerExample$Backend.prototype.doGetJsonV2__V = (function() {
  var d = new $g["Date"]();
  $uI(d["getSeconds"]());
  this.intervalSec$1;
  var this$1 = this.services$1;
  var f = new $c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1().init___Lexample_TimerExample$Backend__T(this, "http://localhost:4567");
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    var v1 = these.head__O();
    f.apply__T3__V($as_T3(v1));
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
$c_Lexample_TimerExample$Backend.prototype.example$TimerExample$Backend$$url$1__T__T__T = (function(s, urlBase$1) {
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([urlBase$1, s, "search"]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  var this$3 = $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf));
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$3, "", "/", "")
});
var $is_Lexample_TimerExample$Backend = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lexample_TimerExample$Backend)))
});
var $as_Lexample_TimerExample$Backend = (function(obj) {
  return (($is_Lexample_TimerExample$Backend(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "example.TimerExample$Backend"))
});
var $isArrayOf_Lexample_TimerExample$Backend = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lexample_TimerExample$Backend)))
});
var $asArrayOf_Lexample_TimerExample$Backend = (function(obj, depth) {
  return (($isArrayOf_Lexample_TimerExample$Backend(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lexample.TimerExample$Backend;", depth))
});
var $d_Lexample_TimerExample$Backend = new $TypeData().initClass({
  Lexample_TimerExample$Backend: 0
}, false, "example.TimerExample$Backend", {
  Lexample_TimerExample$Backend: 1,
  O: 1
});
$c_Lexample_TimerExample$Backend.prototype.$classData = $d_Lexample_TimerExample$Backend;
/** @constructor */
var $c_Ljapgolly_scalajs_react_CompStateAccess = (function() {
  $c_O.call(this)
});
$c_Ljapgolly_scalajs_react_CompStateAccess.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CompStateAccess.prototype.constructor = $c_Ljapgolly_scalajs_react_CompStateAccess;
/** @constructor */
var $h_Ljapgolly_scalajs_react_CompStateAccess = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_CompStateAccess.prototype = $c_Ljapgolly_scalajs_react_CompStateAccess.prototype;
/** @constructor */
var $c_Ljapgolly_scalajs_react_Internal$ = (function() {
  $c_O.call(this);
  this.fcUnit$1 = null;
  this.fcEither$1 = null
});
$c_Ljapgolly_scalajs_react_Internal$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_Internal$.prototype.constructor = $c_Ljapgolly_scalajs_react_Internal$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_Internal$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_Internal$.prototype = $c_Ljapgolly_scalajs_react_Internal$.prototype;
$c_Ljapgolly_scalajs_react_Internal$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_Internal$ = this;
  this.fcUnit$1 = new $c_Ljapgolly_scalajs_react_Internal$FnComposer().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(r$2) {
    var r = $as_Ljapgolly_scalajs_react_Internal$FnResults(r$2);
    r.a__O();
    r.b__O()
  })));
  this.fcEither$1 = new $c_Ljapgolly_scalajs_react_Internal$FnComposer().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(r$2$1) {
    var r$1 = $as_Ljapgolly_scalajs_react_Internal$FnResults(r$2$1);
    return ($uZ(r$1.a__O()) || $uZ(r$1.b__O()))
  })));
  return this
});
var $d_Ljapgolly_scalajs_react_Internal$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_Internal$: 0
}, false, "japgolly.scalajs.react.Internal$", {
  Ljapgolly_scalajs_react_Internal$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_Internal$.prototype.$classData = $d_Ljapgolly_scalajs_react_Internal$;
var $n_Ljapgolly_scalajs_react_Internal$ = (void 0);
var $m_Ljapgolly_scalajs_react_Internal$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_Internal$)) {
    $n_Ljapgolly_scalajs_react_Internal$ = new $c_Ljapgolly_scalajs_react_Internal$().init___()
  };
  return $n_Ljapgolly_scalajs_react_Internal$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_Internal$FnComposer = (function() {
  $c_O.call(this);
  this.japgolly$scalajs$react$Internal$FnComposer$$m$f = null
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_Internal$FnComposer.prototype.constructor = $c_Ljapgolly_scalajs_react_Internal$FnComposer;
/** @constructor */
var $h_Ljapgolly_scalajs_react_Internal$FnComposer = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_Internal$FnComposer.prototype = $c_Ljapgolly_scalajs_react_Internal$FnComposer.prototype;
$c_Ljapgolly_scalajs_react_Internal$FnComposer.prototype.init___F1 = (function(m) {
  this.japgolly$scalajs$react$Internal$FnComposer$$m$f = m;
  return this
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer.prototype.apply__sjs_js_UndefOr__F1__F1 = (function(uf, g) {
  var f = new $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2().init___Ljapgolly_scalajs_react_Internal$FnComposer__F1(this, g);
  if ((uf === (void 0))) {
    var jsx$1 = g
  } else {
    var f$1 = $as_F1(uf);
    var jsx$1 = new $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3().init___Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2__F1(f, f$1)
  };
  return $as_F1(jsx$1)
});
var $d_Ljapgolly_scalajs_react_Internal$FnComposer = new $TypeData().initClass({
  Ljapgolly_scalajs_react_Internal$FnComposer: 0
}, false, "japgolly.scalajs.react.Internal$FnComposer", {
  Ljapgolly_scalajs_react_Internal$FnComposer: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer.prototype.$classData = $d_Ljapgolly_scalajs_react_Internal$FnComposer;
/** @constructor */
var $c_Ljapgolly_scalajs_react_Internal$FnResults = (function() {
  $c_O.call(this);
  this.aa$1 = null;
  this.bb$1 = null;
  this.a$1 = null;
  this.b$1 = null;
  this.bitmap$0$1 = 0
});
$c_Ljapgolly_scalajs_react_Internal$FnResults.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_Internal$FnResults.prototype.constructor = $c_Ljapgolly_scalajs_react_Internal$FnResults;
/** @constructor */
var $h_Ljapgolly_scalajs_react_Internal$FnResults = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_Internal$FnResults.prototype = $c_Ljapgolly_scalajs_react_Internal$FnResults.prototype;
$c_Ljapgolly_scalajs_react_Internal$FnResults.prototype.init___F0__F0 = (function(aa, bb) {
  this.aa$1 = aa;
  this.bb$1 = bb;
  return this
});
$c_Ljapgolly_scalajs_react_Internal$FnResults.prototype.a__O = (function() {
  return (((1 & this.bitmap$0$1) === 0) ? this.a$lzycompute__p1__O() : this.a$1)
});
$c_Ljapgolly_scalajs_react_Internal$FnResults.prototype.b$lzycompute__p1__O = (function() {
  if (((2 & this.bitmap$0$1) === 0)) {
    this.b$1 = this.bb$1.apply__O();
    this.bitmap$0$1 = (2 | this.bitmap$0$1)
  };
  this.bb$1 = null;
  return this.b$1
});
$c_Ljapgolly_scalajs_react_Internal$FnResults.prototype.b__O = (function() {
  return (((2 & this.bitmap$0$1) === 0) ? this.b$lzycompute__p1__O() : this.b$1)
});
$c_Ljapgolly_scalajs_react_Internal$FnResults.prototype.a$lzycompute__p1__O = (function() {
  if (((1 & this.bitmap$0$1) === 0)) {
    this.a$1 = this.aa$1.apply__O();
    this.bitmap$0$1 = (1 | this.bitmap$0$1)
  };
  this.aa$1 = null;
  return this.a$1
});
var $is_Ljapgolly_scalajs_react_Internal$FnResults = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_Internal$FnResults)))
});
var $as_Ljapgolly_scalajs_react_Internal$FnResults = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_Internal$FnResults(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.Internal$FnResults"))
});
var $isArrayOf_Ljapgolly_scalajs_react_Internal$FnResults = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_Internal$FnResults)))
});
var $asArrayOf_Ljapgolly_scalajs_react_Internal$FnResults = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_Internal$FnResults(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.Internal$FnResults;", depth))
});
var $d_Ljapgolly_scalajs_react_Internal$FnResults = new $TypeData().initClass({
  Ljapgolly_scalajs_react_Internal$FnResults: 0
}, false, "japgolly.scalajs.react.Internal$FnResults", {
  Ljapgolly_scalajs_react_Internal$FnResults: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_Internal$FnResults.prototype.$classData = $d_Ljapgolly_scalajs_react_Internal$FnResults;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB = (function() {
  $c_O.call(this);
  this.name$1 = null;
  this.japgolly$scalajs$react$ReactComponentB$$initF$f = null;
  this.japgolly$scalajs$react$ReactComponentB$$backF$f = null;
  this.japgolly$scalajs$react$ReactComponentB$$rendF$f = null;
  this.japgolly$scalajs$react$ReactComponentB$$lc$f = null;
  this.japgolly$scalajs$react$ReactComponentB$$jsMixins$f = null
});
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype.propsUnit__s_Predef$$eq$colon$eq__Ljapgolly_scalajs_react_ReactComponentB$Builder = (function(ev) {
  return this.propsConst__F0__Ljapgolly_scalajs_react_ReactComponentB$Builder(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(ev$1) {
    return (function() {
      return (void 0)
    })
  })(ev)))
});
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype.componentWillUnmount__F1__Ljapgolly_scalajs_react_ReactComponentB = (function(f) {
  var x$48 = $m_Ljapgolly_scalajs_react_Internal$().fcUnit$1.apply__sjs_js_UndefOr__F1__F1(this.japgolly$scalajs$react$ReactComponentB$$lc$f.componentWillUnmount$1, f);
  var this$2 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$49 = this$2.configureSpec$1;
  var this$3 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$50 = this$3.getDefaultProps$1;
  var this$4 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$51 = this$4.componentWillMount$1;
  var this$5 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$52 = this$5.componentDidMount$1;
  var this$6 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$53 = this$6.componentWillUpdate$1;
  var this$7 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$54 = this$7.componentDidUpdate$1;
  var this$8 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$55 = this$8.componentWillReceiveProps$1;
  var this$9 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$56 = this$9.shouldComponentUpdate$1;
  this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var a = new $c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle().init___sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr(x$49, x$50, x$51, x$52, x$48, x$53, x$54, x$55, x$56);
  var x$16 = this.name$1;
  var x$17 = this.japgolly$scalajs$react$ReactComponentB$$initF$f;
  var x$18 = this.japgolly$scalajs$react$ReactComponentB$$backF$f;
  var x$19 = this.japgolly$scalajs$react$ReactComponentB$$rendF$f;
  var x$20 = this.japgolly$scalajs$react$ReactComponentB$$jsMixins$f;
  return new $c_Ljapgolly_scalajs_react_ReactComponentB().init___T__F1__F1__F1__Ljapgolly_scalajs_react_ReactComponentB$LifeCycle__sci_Vector(x$16, x$17, x$18, x$19, a, x$20)
});
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype.propsConst__F0__Ljapgolly_scalajs_react_ReactComponentB$Builder = (function(p) {
  var cc = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(p$2) {
    return (function(x$13$2) {
      return new $c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps().init___Ljapgolly_scalajs_react_ReactComponentCU__sjs_js_UndefOr__sjs_js_UndefOr__F0(x$13$2, (void 0), (void 0), p$2)
    })
  })(p));
  return new $c_Ljapgolly_scalajs_react_ReactComponentB$Builder().init___Ljapgolly_scalajs_react_ReactComponentB__F1(this, cc)
});
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype.init___T__F1__F1__F1__Ljapgolly_scalajs_react_ReactComponentB$LifeCycle__sci_Vector = (function(name, initF, backF, rendF, lc, jsMixins) {
  this.name$1 = name;
  this.japgolly$scalajs$react$ReactComponentB$$initF$f = initF;
  this.japgolly$scalajs$react$ReactComponentB$$backF$f = backF;
  this.japgolly$scalajs$react$ReactComponentB$$rendF$f = rendF;
  this.japgolly$scalajs$react$ReactComponentB$$lc$f = lc;
  this.japgolly$scalajs$react$ReactComponentB$$jsMixins$f = jsMixins;
  return this
});
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype.componentDidMount__F1__Ljapgolly_scalajs_react_ReactComponentB = (function(f) {
  var x$39 = $m_Ljapgolly_scalajs_react_Internal$().fcUnit$1.apply__sjs_js_UndefOr__F1__F1(this.japgolly$scalajs$react$ReactComponentB$$lc$f.componentDidMount$1, f);
  var this$2 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$40 = this$2.configureSpec$1;
  var this$3 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$41 = this$3.getDefaultProps$1;
  var this$4 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$42 = this$4.componentWillMount$1;
  var this$5 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$43 = this$5.componentWillUnmount$1;
  var this$6 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$44 = this$6.componentWillUpdate$1;
  var this$7 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$45 = this$7.componentDidUpdate$1;
  var this$8 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$46 = this$8.componentWillReceiveProps$1;
  var this$9 = this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var x$47 = this$9.shouldComponentUpdate$1;
  this.japgolly$scalajs$react$ReactComponentB$$lc$f;
  var a = new $c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle().init___sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr(x$40, x$41, x$42, x$39, x$43, x$44, x$45, x$46, x$47);
  var x$16 = this.name$1;
  var x$17 = this.japgolly$scalajs$react$ReactComponentB$$initF$f;
  var x$18 = this.japgolly$scalajs$react$ReactComponentB$$backF$f;
  var x$19 = this.japgolly$scalajs$react$ReactComponentB$$rendF$f;
  var x$20 = this.japgolly$scalajs$react$ReactComponentB$$jsMixins$f;
  return new $c_Ljapgolly_scalajs_react_ReactComponentB().init___T__F1__F1__F1__Ljapgolly_scalajs_react_ReactComponentB$LifeCycle__sci_Vector(x$16, x$17, x$18, x$19, a, x$20)
});
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype.propsRequired__Ljapgolly_scalajs_react_ReactComponentB$Builder = (function() {
  var cc = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$11$2) {
    return new $c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps().init___Ljapgolly_scalajs_react_ReactComponentCU__sjs_js_UndefOr__sjs_js_UndefOr(x$11$2, (void 0), (void 0))
  }));
  return new $c_Ljapgolly_scalajs_react_ReactComponentB$Builder().init___Ljapgolly_scalajs_react_ReactComponentB__F1(this, cc)
});
var $d_Ljapgolly_scalajs_react_ReactComponentB = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB: 0
}, false, "japgolly.scalajs.react.ReactComponentB", {
  Ljapgolly_scalajs_react_ReactComponentB: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB$ = (function() {
  $c_O.call(this)
});
$c_Ljapgolly_scalajs_react_ReactComponentB$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentB$.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB$.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB$.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB$.prototype.defaultDomTypeAndProps__Ljapgolly_scalajs_react_ReactComponentB$PSBN__Ljapgolly_scalajs_react_ReactComponentB$Builder = (function(c) {
  var c$1 = c.domType__Ljapgolly_scalajs_react_ReactComponentB();
  return c$1.propsRequired__Ljapgolly_scalajs_react_ReactComponentB$Builder()
});
var $d_Ljapgolly_scalajs_react_ReactComponentB$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB$: 0
}, false, "japgolly.scalajs.react.ReactComponentB$", {
  Ljapgolly_scalajs_react_ReactComponentB$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB$.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB$;
var $n_Ljapgolly_scalajs_react_ReactComponentB$ = (void 0);
var $m_Ljapgolly_scalajs_react_ReactComponentB$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_ReactComponentB$)) {
    $n_Ljapgolly_scalajs_react_ReactComponentB$ = new $c_Ljapgolly_scalajs_react_ReactComponentB$().init___()
  };
  return $n_Ljapgolly_scalajs_react_ReactComponentB$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB$Builder = (function() {
  $c_O.call(this);
  this.cc$1 = null;
  this.$$outer$1 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB$Builder;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB$Builder = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB$Builder.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB$Builder.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder.prototype.init___Ljapgolly_scalajs_react_ReactComponentB__F1 = (function($$outer, cc) {
  this.cc$1 = cc;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder.prototype.buildSpec__Ljapgolly_scalajs_react_ReactComponentSpec = (function() {
  $m_Ljapgolly_scalajs_react_package$();
  var v = this.$$outer$1.name$1;
  var spec = {
    "displayName": v,
    "backend": ($m_Ljapgolly_scalajs_react_package$(), 0),
    "render": (function(f) {
      return (function() {
        return f.apply__O__O(this)
      })
    })(this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$rendF$f)
  };
  var componentWillMount2 = new $c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2().init___Ljapgolly_scalajs_react_ReactComponentB$Builder(this);
  spec["componentWillMount"] = (function(f$1) {
    return (function() {
      return f$1.apply__O__O(this)
    })
  })(componentWillMount2);
  var initStateFn = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer) {
    return (function($$2) {
      return $m_Ljapgolly_scalajs_react_package$().WrapObj__O__Ljapgolly_scalajs_react_package$WrapObj(arg$outer.$$outer$1.japgolly$scalajs$react$ReactComponentB$$initF$f.apply__O__O($$2))
    })
  })(this));
  spec["getInitialState"] = (function(f$2) {
    return (function() {
      return f$2.apply__O__O(this)
    })
  })(initStateFn);
  var $$this = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.getDefaultProps$1;
  if (($$this !== (void 0))) {
    var f$3 = $as_F0($$this);
    spec["getDefaultProps"] = (function(f$4) {
      return (function() {
        return f$4.apply__O()
      })
    })(f$3)
  };
  var $$this$1 = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.componentWillUnmount$1;
  if (($$this$1 !== (void 0))) {
    var f$5 = $as_F1($$this$1);
    spec["componentWillUnmount"] = (function(f$6) {
      return (function() {
        return f$6.apply__O__O(this)
      })
    })(f$5)
  };
  var $$this$2 = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.componentDidMount$1;
  if (($$this$2 !== (void 0))) {
    var f$7 = $as_F1($$this$2);
    spec["componentDidMount"] = (function(f$8) {
      return (function() {
        return f$8.apply__O__O(this)
      })
    })(f$7)
  };
  var fn = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.componentWillUpdate$1;
  if ((fn !== (void 0))) {
    var f$9 = $as_F3(fn);
    var g = new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function(f$9$1) {
      return (function(t$2, p$2, s$2) {
        return f$9$1.apply__O__O__O__O(t$2, p$2["v"], s$2["v"])
      })
    })(f$9));
    spec["componentWillUpdate"] = (function(f$10) {
      return (function(arg1, arg2) {
        return f$10.apply__O__O__O__O(this, arg1, arg2)
      })
    })(g)
  };
  var fn$1 = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.componentDidUpdate$1;
  if ((fn$1 !== (void 0))) {
    var f$11 = $as_F3(fn$1);
    var g$1 = new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function(f$9$2) {
      return (function(t$2$1, p$2$1, s$2$1) {
        return f$9$2.apply__O__O__O__O(t$2$1, p$2$1["v"], s$2$1["v"])
      })
    })(f$11));
    spec["componentDidUpdate"] = (function(f$12) {
      return (function(arg1$1, arg2$1) {
        return f$12.apply__O__O__O__O(this, arg1$1, arg2$1)
      })
    })(g$1)
  };
  var fn$2 = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.shouldComponentUpdate$1;
  if ((fn$2 !== (void 0))) {
    var f$13 = $as_F3(fn$2);
    var g$2 = new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function(f$9$3) {
      return (function(t$2$2, p$2$2, s$2$2) {
        return f$9$3.apply__O__O__O__O(t$2$2, p$2$2["v"], s$2$2["v"])
      })
    })(f$13));
    spec["shouldComponentUpdate"] = (function(f$14) {
      return (function(arg1$2, arg2$2) {
        return f$14.apply__O__O__O__O(this, arg1$2, arg2$2)
      })
    })(g$2)
  };
  var $$this$3 = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.componentWillReceiveProps$1;
  if (($$this$3 !== (void 0))) {
    var f$15 = $as_F2($$this$3);
    var g$3 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(f$10$1) {
      return (function(t$2$3, p$2$3) {
        f$10$1.apply__O__O__O(t$2$3, p$2$3["v"])
      })
    })(f$15));
    spec["componentWillReceiveProps"] = (function(f$16) {
      return (function(arg1$3) {
        return f$16.apply__O__O__O(this, arg1$3)
      })
    })(g$3)
  };
  var this$24 = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$jsMixins$f;
  if ($s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$24)) {
    var col = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$jsMixins$f;
    if ($is_sjs_js_ArrayOps(col)) {
      var x2 = $as_sjs_js_ArrayOps(col);
      var mixins = x2.scala$scalajs$js$ArrayOps$$array$f
    } else if ($is_sjs_js_WrappedArray(col)) {
      var x3 = $as_sjs_js_WrappedArray(col);
      var mixins = x3.array$6
    } else {
      var result = [];
      var this$26 = col.iterator__sci_VectorIterator();
      while (this$26.$$undhasNext$2) {
        var arg1$4 = this$26.next__O();
        $uI(result["push"](arg1$4))
      };
      var mixins = result
    };
    spec["mixins"] = mixins
  };
  var $$this$4 = this.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.configureSpec$1;
  if (($$this$4 !== (void 0))) {
    var x$14 = $as_F1($$this$4);
    x$14.apply__O__O(spec)
  };
  return spec
});
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder.prototype.build__O = (function() {
  return this.cc$1.apply__O__O($g["React"]["createFactory"]($g["React"]["createClass"](this.buildSpec__Ljapgolly_scalajs_react_ReactComponentSpec())))
});
var $d_Ljapgolly_scalajs_react_ReactComponentB$Builder = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB$Builder: 0
}, false, "japgolly.scalajs.react.ReactComponentB$Builder", {
  Ljapgolly_scalajs_react_ReactComponentB$Builder: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB$Builder;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB$P = (function() {
  $c_O.call(this);
  this.name$1 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB$P;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB$P = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB$P.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype.render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN = (function(f) {
  return this.stateless__Ljapgolly_scalajs_react_ReactComponentB$PS().render__F2__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(f$4) {
    return (function(p$2, x$6$2) {
      $asUnit(x$6$2);
      return f$4.apply__O__O(p$2)
    })
  })(f)))
});
$c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype.initialState__F0__Ljapgolly_scalajs_react_ReactComponentB$PS = (function(s) {
  return this.initialStateC__F1__Ljapgolly_scalajs_react_ReactComponentB$PS(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(s$1) {
    return (function(x$5$2) {
      return s$1.apply__O()
    })
  })(s)))
});
$c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype.initialStateC__F1__Ljapgolly_scalajs_react_ReactComponentB$PS = (function(f) {
  return new $c_Ljapgolly_scalajs_react_ReactComponentB$PS().init___T__F1(this.name$1, f)
});
$c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype.init___T = (function(name) {
  this.name$1 = name;
  return this
});
$c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype.stateless__Ljapgolly_scalajs_react_ReactComponentB$PS = (function() {
  return this.initialState__F0__Ljapgolly_scalajs_react_ReactComponentB$PS(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function() {
    return (void 0)
  })))
});
var $d_Ljapgolly_scalajs_react_ReactComponentB$P = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB$P: 0
}, false, "japgolly.scalajs.react.ReactComponentB$P", {
  Ljapgolly_scalajs_react_ReactComponentB$P: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB$P.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB$P;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB$PS = (function() {
  $c_O.call(this);
  this.name$1 = null;
  this.initF$1 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB$PS;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB$PS = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype.backend__F1__Ljapgolly_scalajs_react_ReactComponentB$PSB = (function(f) {
  return new $c_Ljapgolly_scalajs_react_ReactComponentB$PSB().init___T__F1__F1(this.name$1, this.initF$1, f)
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype.render__F2__Ljapgolly_scalajs_react_ReactComponentB$PSBN = (function(f) {
  return this.noBackend__Ljapgolly_scalajs_react_ReactComponentB$PSB().render__F3__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function(f$6) {
    return (function(p$2, s$2, x$9$2) {
      $asUnit(x$9$2);
      return f$6.apply__O__O__O(p$2, s$2)
    })
  })(f)))
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype.noBackend__Ljapgolly_scalajs_react_ReactComponentB$PSB = (function() {
  return this.backend__F1__Ljapgolly_scalajs_react_ReactComponentB$PSB(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$8$2) {
    return (void 0)
  })))
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype.init___T__F1 = (function(name, initF) {
  this.name$1 = name;
  this.initF$1 = initF;
  return this
});
var $d_Ljapgolly_scalajs_react_ReactComponentB$PS = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB$PS: 0
}, false, "japgolly.scalajs.react.ReactComponentB$PS", {
  Ljapgolly_scalajs_react_ReactComponentB$PS: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PS.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB$PS;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB$PSB = (function() {
  $c_O.call(this);
  this.name$1 = null;
  this.initF$1 = null;
  this.backF$1 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PSB.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentB$PSB.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB$PSB;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB$PSB = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB$PSB.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB$PSB.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB$PSB.prototype.render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN = (function(f) {
  return new $c_Ljapgolly_scalajs_react_ReactComponentB$PSBN().init___T__F1__F1__F1(this.name$1, this.initF$1, this.backF$1, f)
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PSB.prototype.init___T__F1__F1 = (function(name, initF, backF) {
  this.name$1 = name;
  this.initF$1 = initF;
  this.backF$1 = backF;
  return this
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PSB.prototype.render__F3__Ljapgolly_scalajs_react_ReactComponentB$PSBN = (function(f) {
  return this.render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(f$2) {
    return (function(s$2) {
      return f$2.apply__O__O__O__O(($m_Ljapgolly_scalajs_react_package$(), s$2["props"]["v"]), ($m_Ljapgolly_scalajs_react_package$(), s$2["state"]["v"]), s$2["backend"])
    })
  })(f)))
});
var $d_Ljapgolly_scalajs_react_ReactComponentB$PSB = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB$PSB: 0
}, false, "japgolly.scalajs.react.ReactComponentB$PSB", {
  Ljapgolly_scalajs_react_ReactComponentB$PSB: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PSB.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB$PSB;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB$PSBN = (function() {
  $c_O.call(this);
  this.name$1 = null;
  this.initF$1 = null;
  this.backF$1 = null;
  this.rendF$1 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PSBN.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentB$PSBN.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB$PSBN;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB$PSBN = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB$PSBN.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB$PSBN.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB$PSBN.prototype.domType__Ljapgolly_scalajs_react_ReactComponentB = (function() {
  var jsx$5 = this.name$1;
  var jsx$4 = this.initF$1;
  var jsx$3 = this.backF$1;
  var jsx$2 = this.rendF$1;
  var jsx$1 = new $c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle().init___sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr((void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0));
  var this$2 = $m_s_package$().Vector$1;
  return new $c_Ljapgolly_scalajs_react_ReactComponentB().init___T__F1__F1__F1__Ljapgolly_scalajs_react_ReactComponentB$LifeCycle__sci_Vector(jsx$5, jsx$4, jsx$3, jsx$2, jsx$1, this$2.NIL$6)
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PSBN.prototype.init___T__F1__F1__F1 = (function(name, initF, backF, rendF) {
  this.name$1 = name;
  this.initF$1 = initF;
  this.backF$1 = backF;
  this.rendF$1 = rendF;
  return this
});
var $d_Ljapgolly_scalajs_react_ReactComponentB$PSBN = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB$PSBN: 0
}, false, "japgolly.scalajs.react.ReactComponentB$PSBN", {
  Ljapgolly_scalajs_react_ReactComponentB$PSBN: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB$PSBN.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB$PSBN;
/** @constructor */
var $c_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$ = (function() {
  $c_O.call(this)
});
$c_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$.prototype.constructor = $c_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$.prototype = $c_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$.prototype;
$c_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$.prototype.render$extension__Ljapgolly_scalajs_react_ReactComponentU__Lorg_scalajs_dom_raw_Node__Ljapgolly_scalajs_react_ReactComponentM = (function($$this, n) {
  return $g["React"]["render"]($$this, n)
});
var $d_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$: 0
}, false, "japgolly.scalajs.react.package$ReactExt_ReactComponentU$", {
  Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$.prototype.$classData = $d_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$;
var $n_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$ = (void 0);
var $m_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$)) {
    $n_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$ = new $c_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$().init___()
  };
  return $n_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Builder = (function() {
  $c_O.call(this);
  this.className$1 = null;
  this.japgolly$scalajs$react$vdom$Builder$$props$f = null;
  this.japgolly$scalajs$react$vdom$Builder$$style$f = null;
  this.children$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Builder;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Builder = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Builder.prototype = $c_Ljapgolly_scalajs_react_vdom_Builder.prototype;
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.init___ = (function() {
  this.className$1 = (void 0);
  this.japgolly$scalajs$react$vdom$Builder$$props$f = {};
  this.japgolly$scalajs$react$vdom$Builder$$style$f = {};
  this.children$1 = [];
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.render__T__Ljapgolly_scalajs_react_ReactElement = (function(tag) {
  var $$this = this.className$1;
  if (($$this !== (void 0))) {
    var o = this.japgolly$scalajs$react$vdom$Builder$$props$f;
    o["className"] = $$this
  };
  if (($uI($g["Object"]["keys"](this.japgolly$scalajs$react$vdom$Builder$$style$f)["length"]) !== 0)) {
    var o$1 = this.japgolly$scalajs$react$vdom$Builder$$props$f;
    var v = this.japgolly$scalajs$react$vdom$Builder$$style$f;
    o$1["style"] = v
  };
  var jsx$1 = $g["React"];
  var jsx$5 = jsx$1["createElement"];
  var jsx$4 = this.japgolly$scalajs$react$vdom$Builder$$props$f;
  var array = this.children$1;
  matchEnd5: {
    var jsx$3;
    var jsx$3 = array;
    break matchEnd5
  };
  var jsx$2 = [tag, jsx$4]["concat"](jsx$3);
  return jsx$5["apply"](jsx$1, jsx$2)
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.addAttr__T__sjs_js_Any__V = (function(k, v) {
  var o = this.japgolly$scalajs$react$vdom$Builder$$props$f;
  o[k] = v
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.appendChild__Ljapgolly_scalajs_react_ReactNode__V = (function(c) {
  this.children$1["push"](c)
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.addClassName__sjs_js_Any__V = (function(n) {
  var $$this = this.className$1;
  var value$1 = (($$this === (void 0)) ? n : new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$$this, n])));
  this.className$1 = value$1
});
var $d_Ljapgolly_scalajs_react_vdom_Builder = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Builder: 0
}, false, "japgolly.scalajs.react.vdom.Builder", {
  Ljapgolly_scalajs_react_vdom_Builder: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Builder;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$ = (function() {
  $c_O.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_ClassNameAttr$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_ClassNameAttr$.prototype = $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$.prototype;
var $d_Ljapgolly_scalajs_react_vdom_ClassNameAttr$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_ClassNameAttr$: 0
}, false, "japgolly.scalajs.react.vdom.ClassNameAttr$", {
  Ljapgolly_scalajs_react_vdom_ClassNameAttr$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_ClassNameAttr$;
var $n_Ljapgolly_scalajs_react_vdom_ClassNameAttr$ = (void 0);
var $m_Ljapgolly_scalajs_react_vdom_ClassNameAttr$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_ClassNameAttr$)) {
    $n_Ljapgolly_scalajs_react_vdom_ClassNameAttr$ = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_ClassNameAttr$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Escaping$ = (function() {
  $c_O.call(this);
  this.tagRegex$1 = null;
  this.attrNameRegex$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Escaping$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Escaping$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Escaping$.prototype = $c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_Escaping$ = this;
  var this$2 = new $c_sci_StringOps().init___T("^[a-z][\\w0-9-]*$");
  var groupNames = $m_sci_Nil$();
  this.tagRegex$1 = new $c_s_util_matching_Regex().init___T__sc_Seq(this$2.repr$1, groupNames).pattern$1;
  var this$5 = new $c_sci_StringOps().init___T("^[a-zA-Z_:][-a-zA-Z0-9_:.]*$");
  var groupNames$1 = $m_sci_Nil$();
  this.attrNameRegex$1 = new $c_s_util_matching_Regex().init___T__sc_Seq(this$5.repr$1, groupNames$1).pattern$1;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype.assertValidTag__T__V = (function(s) {
  if ((!this.validTag__T__Z(s))) {
    throw new $c_jl_IllegalArgumentException().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Illegal tag name: ", " is not a valid XML tag name"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([s])))
  }
});
$c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype.validAttrName__T__Z = (function(s) {
  var this$1 = this.attrNameRegex$1;
  return new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$1, s, 0, $uI(s["length"])).matches__Z()
});
$c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype.validTag__T__Z = (function(s) {
  var this$1 = this.tagRegex$1;
  return new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$1, s, 0, $uI(s["length"])).matches__Z()
});
$c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype.assertValidAttrName__T__V = (function(s) {
  if ((!this.validAttrName__T__Z(s))) {
    throw new $c_jl_IllegalArgumentException().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Illegal attribute name: ", " is not a valid XML attribute name"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([s])))
  }
});
var $d_Ljapgolly_scalajs_react_vdom_Escaping$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Escaping$: 0
}, false, "japgolly.scalajs.react.vdom.Escaping$", {
  Ljapgolly_scalajs_react_vdom_Escaping$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Escaping$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Escaping$;
var $n_Ljapgolly_scalajs_react_vdom_Escaping$ = (void 0);
var $m_Ljapgolly_scalajs_react_vdom_Escaping$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Escaping$)) {
    $n_Ljapgolly_scalajs_react_vdom_Escaping$ = new $c_Ljapgolly_scalajs_react_vdom_Escaping$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Escaping$
});
var $s_Ljapgolly_scalajs_react_vdom_Extra$Attrs$class__dangerouslySetInnerHtml__Ljapgolly_scalajs_react_vdom_Extra$Attrs__T__Ljapgolly_scalajs_react_vdom_TagMod = (function($$this, html) {
  var o = {
    "__html": ($m_Ljapgolly_scalajs_react_package$(), html)
  };
  var this$2 = $$this.dangerouslySetInnerHtmlAttr$4;
  var ev = $m_Ljapgolly_scalajs_react_vdom_Implicits$().$$undreact$undattrJsObj$2;
  return new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue(this$2, o, ev)
});
var $s_Ljapgolly_scalajs_react_vdom_Extra$Attrs$class__$$init$__Ljapgolly_scalajs_react_vdom_Extra$Attrs__V = (function($$this) {
  $$this.className$4 = $m_Ljapgolly_scalajs_react_vdom_ClassNameAttr$();
  $$this.cls$4 = $$this.className$4;
  $$this.class$4 = $$this.className$4;
  $$this.colSpan$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("colSpan"));
  $$this.rowSpan$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("rowSpan"));
  $$this.htmlFor$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("htmlFor"));
  $$this.ref$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("ref"));
  $$this.key$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("key"));
  $$this.draggable$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("draggable"));
  $$this.onDragStart$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onDragStart"));
  $$this.onDragEnd$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onDragEnd"));
  $$this.onDragEnter$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onDragEnter"));
  $$this.onDragOver$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onDragOver"));
  $$this.onDragLeave$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onDragLeave"));
  $$this.onDrop$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onDrop"));
  $$this.onBeforeInput$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onBeforeInput"));
  $$this.acceptCharset$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("acceptCharset"));
  $$this.accessKey$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("accessKey"));
  $$this.allowFullScreen$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("allowFullScreen"));
  $$this.allowTransparency$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("allowTransparency"));
  $$this.async$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("async"));
  $$this.autoCapitalize$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("autoCapitalize"));
  $$this.autoCorrect$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("autoCorrect"));
  $$this.autoPlay$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("autoPlay"));
  $$this.cellPadding$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("cellPadding"));
  $$this.cellSpacing$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("cellSpacing"));
  $$this.classID$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("classID"));
  $$this.contentEditable$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("contentEditable"));
  $$this.contextMenu$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("contextMenu"));
  $$this.controls$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("controls"));
  $$this.coords$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("coords"));
  $$this.crossOrigin$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("crossOrigin"));
  $$this.dateTime$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("dateTime"));
  $$this.defer$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("defer"));
  $$this.defaultValue$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("defaultValue"));
  $$this.dir$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("dir"));
  $$this.download$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("download"));
  $$this.encType$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("encType"));
  $$this.formAction$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("formAction"));
  $$this.formEncType$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("formEncType"));
  $$this.formMethod$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("formMethod"));
  $$this.formNoValidate$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("formNoValidate"));
  $$this.formTarget$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("formTarget"));
  $$this.frameBorder$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("frameBorder"));
  $$this.headers$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("headers"));
  $$this.hrefLang$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("hrefLang"));
  $$this.icon$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("icon"));
  $$this.itemProp$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("itemProp"));
  $$this.itemScope$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("itemScope"));
  $$this.itemType$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("itemType"));
  $$this.list$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("list"));
  $$this.loop$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("loop"));
  $$this.manifest$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("manifest"));
  $$this.marginHeight$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("marginHeight"));
  $$this.marginWidth$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("marginWidth"));
  $$this.maxLength$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("maxLength"));
  $$this.mediaGroup$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("mediaGroup"));
  $$this.multiple$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("multiple"));
  $$this.muted$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("muted"));
  $$this.noValidate$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("noValidate"));
  $$this.open$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("open"));
  $$this.poster$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("poster"));
  $$this.preload$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("preload"));
  $$this.radioGroup$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("radioGroup"));
  $$this.sandbox$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("sandbox"));
  $$this.scope$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("scope"));
  $$this.scrolling$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("scrolling"));
  $$this.seamless$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("seamless"));
  $$this.selected$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("selected"));
  $$this.shape$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("shape"));
  $$this.sizes$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("sizes"));
  $$this.srcDoc$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("srcDoc"));
  $$this.srcSet$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("srcSet"));
  $$this.step$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("step"));
  $$this.useMap$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("useMap"));
  $$this.wmode$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("wmode"));
  $$this.dangerouslySetInnerHtmlAttr$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("dangerouslySetInnerHTML"))
});
var $s_Ljapgolly_scalajs_react_vdom_Extra$Tags$class__$$init$__Ljapgolly_scalajs_react_vdom_Extra$Tags__V = (function($$this) {
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("big");
  $$this.big$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("big", $m_sci_Nil$(), namespaceConfig);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$1 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("dialog");
  $$this.dialog$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("dialog", $m_sci_Nil$(), namespaceConfig$1);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$2 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("menuitem");
  $$this.menuitem$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("menuitem", $m_sci_Nil$(), namespaceConfig$2)
});
var $s_Ljapgolly_scalajs_react_vdom_HtmlAttrs$class__$$init$__Ljapgolly_scalajs_react_vdom_HtmlAttrs__V = (function($$this) {
  $$this.href$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("href"));
  $$this.action$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("action"));
  $$this.method$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("method"));
  $$this.id$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("id"));
  $$this.target$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("target"));
  $$this.name$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("name"));
  $$this.alt$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("alt"));
  $$this.onBlur$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onBlur"));
  $$this.onChange$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onChange"));
  $$this.onClick$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onClick"));
  $$this.onDblClick$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onDoubleClick"));
  $$this.onError$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onError"));
  $$this.onFocus$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onFocus"));
  $$this.onKeyDown$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onKeyDown"));
  $$this.onKeyUp$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onKeyUp"));
  $$this.onKeyPress$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onKeyPress"));
  $$this.onLoad$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onLoad"));
  $$this.onMouseDown$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onMouseDown"));
  $$this.onMouseMove$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onMouseMove"));
  $$this.onMouseOut$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onMouseOut"));
  $$this.onMouseOver$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onMouseOver"));
  $$this.onMouseUp$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onMouseUp"));
  $$this.onTouchCancel$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onTouchCancel"));
  $$this.onTouchEnd$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onTouchEnd"));
  $$this.onTouchMove$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onTouchMove"));
  $$this.onTouchStart$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onTouchStart"));
  $$this.onSelect$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onSelect"));
  $$this.onScroll$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onScroll"));
  $$this.onSubmit$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onSubmit"));
  $$this.onReset$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("onReset"));
  $$this.rel$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("rel"));
  $$this.src$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("src"));
  $$this.style$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("style"));
  $$this.title$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("title"));
  $$this.type$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("type"));
  $$this.tpe$4 = $$this.type$4;
  $$this.xmlns$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("xmlns"));
  $$this.lang$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("lang"));
  $$this.placeholder$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("placeholder"));
  $$this.spellCheck$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("spellCheck"));
  $$this.value$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("value"));
  $$this.accept$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("accept"));
  $$this.autoComplete$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("autoComplete"));
  $$this.autoFocus$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("autoFocus"));
  $$this.checked$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("checked"));
  $$this.charset$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("charset"));
  $$this.disabled$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("disabled"));
  $$this.for$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("htmlFor"));
  $$this.readOnly$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("readOnly"));
  $$this.required$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("required"));
  $$this.rows$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("rows"));
  $$this.cols$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("cols"));
  $$this.size$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("size"));
  $$this.tabIndex$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("tabIndex"));
  $$this.role$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("role"));
  $$this.contentAttr$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("content"));
  $$this.httpEquiv$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("httpEquiv"));
  $$this.media$4 = ($m_Ljapgolly_scalajs_react_vdom_Scalatags$(), new $c_Ljapgolly_scalajs_react_vdom_Attr().init___T("media"))
});
var $s_Ljapgolly_scalajs_react_vdom_HtmlStyles$class__$$init$__Ljapgolly_scalajs_react_vdom_HtmlStyles__V = (function($$this) {
  $$this.background$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("background", "background");
  $$this.backgroundRepeat$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("backgroundRepeat", "backgroundRepeat");
  $$this.backgroundPosition$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("backgroundPosition", "backgroundPosition");
  $$this.backgroundColor$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("backgroundColor", "backgroundColor");
  $$this.backgroundImage$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle().init___T__T("backgroundImage", "backgroundImage");
  $$this.borderTopColor$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderTopColor", "borderTopColor");
  $$this.borderStyle$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle().init___T__T("borderStyle", "borderStyle");
  $$this.borderTopStyle$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle().init___T__T("borderTopStyle", "borderTopStyle");
  $$this.borderRightStyle$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle().init___T__T("borderRightStyle", "borderRightStyle");
  $$this.borderRightWidth$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth().init___T__T("borderRightWidth", "borderRightWidth");
  $$this.borderTopRightRadius$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius().init___T__T("borderTopRightRadius", "borderTopRightRadius");
  $$this.borderBottomLeftRadius$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius().init___T__T("borderBottomLeftRadius", "borderBottomLeftRadius");
  $$this.borderRightColor$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderRightColor", "borderRightColor");
  $$this.borderBottom$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderBottom", "borderBottom");
  $$this.border$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("border", "border");
  $$this.borderBottomWidth$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth().init___T__T("borderBottomWidth", "borderBottomWidth");
  $$this.borderLeftColor$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderLeftColor", "borderLeftColor");
  $$this.borderBottomColor$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderBottomColor", "borderBottomColor");
  $$this.borderLeft$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderLeft", "borderLeft");
  $$this.borderLeftStyle$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle().init___T__T("borderLeftStyle", "borderLeftStyle");
  $$this.borderRight$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderRight", "borderRight");
  $$this.borderBottomStyle$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle().init___T__T("borderBottomStyle", "borderBottomStyle");
  $$this.borderLeftWidth$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth().init___T__T("borderLeftWidth", "borderLeftWidth");
  $$this.borderTopWidth$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth().init___T__T("borderTopWidth", "borderTopWidth");
  $$this.borderTop$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderTop", "borderTop");
  $$this.borderRadius$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderRadius", "borderRadius");
  $$this.borderWidth$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderWidth", "borderWidth");
  $$this.borderBottomRightRadius$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius().init___T__T("borderBottomRightRadius", "borderBottomRightRadius");
  $$this.borderTopLeftRadius$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius().init___T__T("borderTopLeftRadius", "borderTopLeftRadius");
  $$this.borderColor$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("borderColor", "borderColor");
  $$this.opacity$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("opacity", "opacity");
  $$this.maxWidth$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("maxWidth", "maxWidth");
  $$this.overflow$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow().init___T__T("overflow", "overflow");
  $$this.height$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("height", "height");
  $$this.paddingRight$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("paddingRight", "paddingRight");
  $$this.paddingTop$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("paddingTop", "paddingTop");
  $$this.paddingLeft$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("paddingLeft", "paddingLeft");
  $$this.padding$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("padding", "padding");
  $$this.paddingBottom$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("paddingBottom", "paddingBottom");
  $$this.right$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("right", "right");
  $$this.lineHeight$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle().init___T__T("lineHeight", "lineHeight");
  $$this.left$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("left", "left");
  $$this.listStyle$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("listStyle", "listStyle");
  $$this.overflowY$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow().init___T__T("overflowY", "overflowY");
  $$this.boxShadow$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("boxShadow", "boxShadow");
  $$this.fontSizeAdjust$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("fontSizeAdjust", "fontSizeAdjust");
  $$this.fontFamily$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("fontFamily", "fontFamily");
  $$this.font$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("font", "font");
  $$this.fontFeatureSettings$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("fontFeatureSettings", "fontFeatureSettings");
  $$this.marginBottom$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("marginBottom", "marginBottom");
  $$this.marginRight$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1().init___Ljapgolly_scalajs_react_vdom_HtmlStyles($$this);
  $$this.marginTop$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2().init___Ljapgolly_scalajs_react_vdom_HtmlStyles($$this);
  $$this.marginLeft$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3().init___Ljapgolly_scalajs_react_vdom_HtmlStyles($$this);
  $$this.top$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("top", "top");
  $$this.width$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("width", "width");
  $$this.bottom$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("bottom", "bottom");
  $$this.letterSpacing$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle().init___T__T("letterSpacing", "letterSpacing");
  $$this.maxHeight$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle().init___T__T("maxHeight", "maxHeight");
  $$this.minWidth$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("minWidth", "minWidth");
  $$this.minHeight$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("minHeight", "minHeight");
  $$this.outline$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("outline", "outline");
  $$this.outlineStyle$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle().init___T__T("outlineStyle", "outlineStyle");
  $$this.overflowX$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow().init___T__T("overflowX", "overflowX");
  $$this.textAlignLast$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4().init___Ljapgolly_scalajs_react_vdom_HtmlStyles($$this);
  $$this.textAlign$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5().init___Ljapgolly_scalajs_react_vdom_HtmlStyles($$this);
  $$this.textIndent$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("textIndent", "textIndent");
  $$this.textShadow$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle().init___T__T("textShadow", "textShadow");
  $$this.wordSpacing$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle().init___T__T("wordSpacing", "wordSpacing");
  $$this.zIndex$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("zIndex", "zIndex");
  $$this.animationDirection$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("animationDirection", "animationDirection");
  $$this.animationDuration$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("animationDuration", "animationDuration");
  $$this.animationName$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("animationName", "animationName");
  $$this.animationFillMode$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("animationFillMode", "animationFillMode");
  $$this.animationIterationCount$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("animationIterationCount", "animationIterationCount");
  $$this.animationDelay$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle().init___T__T("animationDelay", "animationDelay");
  $$this.animationTimingFunction$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("animationTimingFunction", "animationTimingFunction");
  $$this.animationPlayState$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("animationPlayState", "animationPlayState");
  $$this.animation$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("animation", "animation");
  $$this.columnCount$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("columnCount", "columnCount");
  $$this.columnGap$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle().init___T__T("columnGap", "columnGap");
  $$this.columnRule$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("columnRule", "columnRule");
  $$this.columnWidth$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle().init___T__T("columnWidth", "columnWidth");
  $$this.columnRuleColor$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("columnRuleColor", "columnRuleColor");
  $$this.contentStyle$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("content", "content");
  $$this.counterIncrement$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("counterIncrement", "counterIncrement");
  $$this.counterReset$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("counterReset", "counterReset");
  $$this.orphans$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("orphans", "orphans");
  $$this.widows$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("widows", "widows");
  $$this.pageBreakAfter$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak().init___T__T("pageBreakAfter", "pageBreakAfter");
  $$this.pageBreakInside$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak().init___T__T("pageBreakInside", "pageBreakInside");
  $$this.pageBreakBefore$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak().init___T__T("pageBreakBefore", "pageBreakBefore");
  $$this.perspective$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle().init___T__T("perspective", "perspective");
  $$this.perspectiveOrigin$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("perspectiveOrigin", "perspectiveOrigin");
  $$this.transitionDelay$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle().init___T__T("transitionDelay", "transitionDelay");
  $$this.transition$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("transition", "transition");
  $$this.transitionTimingFunction$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("transitionTimingFunction", "transitionTimingFunction");
  $$this.transitionDuration$4 = new $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle().init___T__T("transitionDuration", "transitionDuration");
  $$this.transitionProperty$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("transitionProperty", "transitionProperty");
  $$this.transform$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("transform", "transform");
  $$this.flex$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("flex", "flex");
  $$this.flexBasis$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("flexBasis", "flexBasis");
  $$this.flexGrow$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("flexGrow", "flexGrow");
  $$this.flexShrink$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("flexShrink", "flexShrink");
  $$this.transformOrigin$4 = new $c_Ljapgolly_scalajs_react_vdom_Style().init___T__T("transformOrigin", "transformOrigin")
});
var $s_Ljapgolly_scalajs_react_vdom_HtmlTags$class__$$init$__Ljapgolly_scalajs_react_vdom_HtmlTags__V = (function($$this) {
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("html");
  $$this.html$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("html", $m_sci_Nil$(), namespaceConfig);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$1 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("head");
  $$this.head$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("head", $m_sci_Nil$(), namespaceConfig$1);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$2 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("base");
  $$this.base$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("base", $m_sci_Nil$(), namespaceConfig$2);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$3 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("link");
  $$this.link$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("link", $m_sci_Nil$(), namespaceConfig$3);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$4 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("meta");
  $$this.meta$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("meta", $m_sci_Nil$(), namespaceConfig$4);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$5 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("script");
  $$this.script$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("script", $m_sci_Nil$(), namespaceConfig$5);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$6 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("body");
  $$this.body$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("body", $m_sci_Nil$(), namespaceConfig$6);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$7 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("h1");
  $$this.h1$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("h1", $m_sci_Nil$(), namespaceConfig$7);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$8 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("h2");
  $$this.h2$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("h2", $m_sci_Nil$(), namespaceConfig$8);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$9 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("h3");
  $$this.h3$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("h3", $m_sci_Nil$(), namespaceConfig$9);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$10 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("h4");
  $$this.h4$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("h4", $m_sci_Nil$(), namespaceConfig$10);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$11 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("h5");
  $$this.h5$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("h5", $m_sci_Nil$(), namespaceConfig$11);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$12 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("h6");
  $$this.h6$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("h6", $m_sci_Nil$(), namespaceConfig$12);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$13 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("header");
  $$this.header$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("header", $m_sci_Nil$(), namespaceConfig$13);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$14 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("footer");
  $$this.footer$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("footer", $m_sci_Nil$(), namespaceConfig$14);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$15 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("p");
  $$this.p$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("p", $m_sci_Nil$(), namespaceConfig$15);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$16 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("hr");
  $$this.hr$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("hr", $m_sci_Nil$(), namespaceConfig$16);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$17 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("pre");
  $$this.pre$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("pre", $m_sci_Nil$(), namespaceConfig$17);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$18 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("blockquote");
  $$this.blockquote$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("blockquote", $m_sci_Nil$(), namespaceConfig$18);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$19 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("ol");
  $$this.ol$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("ol", $m_sci_Nil$(), namespaceConfig$19);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$20 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("ul");
  $$this.ul$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("ul", $m_sci_Nil$(), namespaceConfig$20);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$21 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("li");
  $$this.li$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("li", $m_sci_Nil$(), namespaceConfig$21);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$22 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("dl");
  $$this.dl$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("dl", $m_sci_Nil$(), namespaceConfig$22);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$23 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("dt");
  $$this.dt$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("dt", $m_sci_Nil$(), namespaceConfig$23);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$24 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("dd");
  $$this.dd$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("dd", $m_sci_Nil$(), namespaceConfig$24);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$25 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("figure");
  $$this.figure$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("figure", $m_sci_Nil$(), namespaceConfig$25);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$26 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("figcaption");
  $$this.figcaption$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("figcaption", $m_sci_Nil$(), namespaceConfig$26);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$27 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("div");
  $$this.div$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("div", $m_sci_Nil$(), namespaceConfig$27);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$28 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("a");
  $$this.a$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("a", $m_sci_Nil$(), namespaceConfig$28);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$29 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("em");
  $$this.em$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("em", $m_sci_Nil$(), namespaceConfig$29);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$30 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("strong");
  $$this.strong$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("strong", $m_sci_Nil$(), namespaceConfig$30);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$31 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("small");
  $$this.small$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("small", $m_sci_Nil$(), namespaceConfig$31);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$32 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("s");
  $$this.s$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("s", $m_sci_Nil$(), namespaceConfig$32);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$33 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("cite");
  $$this.cite$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("cite", $m_sci_Nil$(), namespaceConfig$33);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$34 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("code");
  $$this.code$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("code", $m_sci_Nil$(), namespaceConfig$34);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$35 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("sub");
  $$this.sub$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("sub", $m_sci_Nil$(), namespaceConfig$35);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$36 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("sup");
  $$this.sup$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("sup", $m_sci_Nil$(), namespaceConfig$36);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$37 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("i");
  $$this.i$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("i", $m_sci_Nil$(), namespaceConfig$37);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$38 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("b");
  $$this.b$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("b", $m_sci_Nil$(), namespaceConfig$38);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$39 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("u");
  $$this.u$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("u", $m_sci_Nil$(), namespaceConfig$39);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$40 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("span");
  $$this.span$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("span", $m_sci_Nil$(), namespaceConfig$40);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$41 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("br");
  $$this.br$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("br", $m_sci_Nil$(), namespaceConfig$41);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$42 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("wbr");
  $$this.wbr$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("wbr", $m_sci_Nil$(), namespaceConfig$42);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$43 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("ins");
  $$this.ins$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("ins", $m_sci_Nil$(), namespaceConfig$43);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$44 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("del");
  $$this.del$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("del", $m_sci_Nil$(), namespaceConfig$44);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$45 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("img");
  $$this.img$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("img", $m_sci_Nil$(), namespaceConfig$45);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$46 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("iframe");
  $$this.iframe$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("iframe", $m_sci_Nil$(), namespaceConfig$46);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$47 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("embed");
  $$this.embed$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("embed", $m_sci_Nil$(), namespaceConfig$47);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$48 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("object");
  $$this.object$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("object", $m_sci_Nil$(), namespaceConfig$48);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$49 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("param");
  $$this.param$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("param", $m_sci_Nil$(), namespaceConfig$49);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$50 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("video");
  $$this.video$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("video", $m_sci_Nil$(), namespaceConfig$50);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$51 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("audio");
  $$this.audio$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("audio", $m_sci_Nil$(), namespaceConfig$51);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$52 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("source");
  $$this.source$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("source", $m_sci_Nil$(), namespaceConfig$52);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$53 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("track");
  $$this.track$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("track", $m_sci_Nil$(), namespaceConfig$53);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$54 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("canvas");
  $$this.canvas$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("canvas", $m_sci_Nil$(), namespaceConfig$54);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$55 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("map");
  $$this.map$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("map", $m_sci_Nil$(), namespaceConfig$55);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$56 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("area");
  $$this.area$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("area", $m_sci_Nil$(), namespaceConfig$56);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$57 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("table");
  $$this.table$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("table", $m_sci_Nil$(), namespaceConfig$57);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$58 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("caption");
  $$this.caption$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("caption", $m_sci_Nil$(), namespaceConfig$58);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$59 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("colgroup");
  $$this.colgroup$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("colgroup", $m_sci_Nil$(), namespaceConfig$59);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$60 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("col");
  $$this.col$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("col", $m_sci_Nil$(), namespaceConfig$60);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$61 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("tbody");
  $$this.tbody$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("tbody", $m_sci_Nil$(), namespaceConfig$61);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$62 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("thead");
  $$this.thead$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("thead", $m_sci_Nil$(), namespaceConfig$62);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$63 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("tfoot");
  $$this.tfoot$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("tfoot", $m_sci_Nil$(), namespaceConfig$63);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$64 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("tr");
  $$this.tr$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("tr", $m_sci_Nil$(), namespaceConfig$64);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$65 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("td");
  $$this.td$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("td", $m_sci_Nil$(), namespaceConfig$65);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$66 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("th");
  $$this.th$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("th", $m_sci_Nil$(), namespaceConfig$66);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$67 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("form");
  $$this.form$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("form", $m_sci_Nil$(), namespaceConfig$67);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$68 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("fieldset");
  $$this.fieldset$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("fieldset", $m_sci_Nil$(), namespaceConfig$68);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$69 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("legend");
  $$this.legend$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("legend", $m_sci_Nil$(), namespaceConfig$69);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$70 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("label");
  $$this.label$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("label", $m_sci_Nil$(), namespaceConfig$70);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$71 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("input");
  $$this.input$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("input", $m_sci_Nil$(), namespaceConfig$71);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$72 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("button");
  $$this.button$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("button", $m_sci_Nil$(), namespaceConfig$72);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$73 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("select");
  $$this.select$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("select", $m_sci_Nil$(), namespaceConfig$73);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$74 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("datalist");
  $$this.datalist$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("datalist", $m_sci_Nil$(), namespaceConfig$74);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$75 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("optgroup");
  $$this.optgroup$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("optgroup", $m_sci_Nil$(), namespaceConfig$75);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$76 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("option");
  $$this.option$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("option", $m_sci_Nil$(), namespaceConfig$76);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$77 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("textarea");
  $$this.textarea$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("textarea", $m_sci_Nil$(), namespaceConfig$77);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$78 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("title");
  $$this.titleTag$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("title", $m_sci_Nil$(), namespaceConfig$78);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$79 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("style");
  $$this.styleTag$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("style", $m_sci_Nil$(), namespaceConfig$79);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$80 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("noscript");
  $$this.noscript$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("noscript", $m_sci_Nil$(), namespaceConfig$80);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$81 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("section");
  $$this.section$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("section", $m_sci_Nil$(), namespaceConfig$81);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$82 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("nav");
  $$this.nav$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("nav", $m_sci_Nil$(), namespaceConfig$82);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$83 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("article");
  $$this.article$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("article", $m_sci_Nil$(), namespaceConfig$83);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$84 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("aside");
  $$this.aside$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("aside", $m_sci_Nil$(), namespaceConfig$84);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$85 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("address");
  $$this.address$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("address", $m_sci_Nil$(), namespaceConfig$85);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$86 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("main");
  $$this.main$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("main", $m_sci_Nil$(), namespaceConfig$86);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$87 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("q");
  $$this.q$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("q", $m_sci_Nil$(), namespaceConfig$87);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$88 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("dfn");
  $$this.dfn$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("dfn", $m_sci_Nil$(), namespaceConfig$88);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$89 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("abbr");
  $$this.abbr$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("abbr", $m_sci_Nil$(), namespaceConfig$89);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$90 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("data");
  $$this.data$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("data", $m_sci_Nil$(), namespaceConfig$90);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$91 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("time");
  $$this.time$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("time", $m_sci_Nil$(), namespaceConfig$91);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$92 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("var");
  $$this.var$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("var", $m_sci_Nil$(), namespaceConfig$92);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$93 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("samp");
  $$this.samp$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("samp", $m_sci_Nil$(), namespaceConfig$93);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$94 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("kbd");
  $$this.kbd$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("kbd", $m_sci_Nil$(), namespaceConfig$94);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$95 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("math");
  $$this.math$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("math", $m_sci_Nil$(), namespaceConfig$95);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$96 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("mark");
  $$this.mark$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("mark", $m_sci_Nil$(), namespaceConfig$96);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$97 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("ruby");
  $$this.ruby$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("ruby", $m_sci_Nil$(), namespaceConfig$97);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$98 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("rt");
  $$this.rt$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("rt", $m_sci_Nil$(), namespaceConfig$98);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$99 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("rp");
  $$this.rp$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("rp", $m_sci_Nil$(), namespaceConfig$99);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$100 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("bdi");
  $$this.bdi$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("bdi", $m_sci_Nil$(), namespaceConfig$100);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$101 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("bdo");
  $$this.bdo$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("bdo", $m_sci_Nil$(), namespaceConfig$101);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$102 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("keygen");
  $$this.keygen$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("keygen", $m_sci_Nil$(), namespaceConfig$102);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$103 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("output");
  $$this.output$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("output", $m_sci_Nil$(), namespaceConfig$103);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$104 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("progress");
  $$this.progress$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("progress", $m_sci_Nil$(), namespaceConfig$104);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$105 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("meter");
  $$this.meter$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("meter", $m_sci_Nil$(), namespaceConfig$105);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$106 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("details");
  $$this.details$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("details", $m_sci_Nil$(), namespaceConfig$106);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$107 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("summary");
  $$this.summary$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("summary", $m_sci_Nil$(), namespaceConfig$107);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$108 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("command");
  $$this.command$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("command", $m_sci_Nil$(), namespaceConfig$108);
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  var namespaceConfig$109 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().implicitNamespace$1;
  $m_Ljapgolly_scalajs_react_vdom_Scalatags$();
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidTag__T__V("menu");
  $$this.menu$4 = new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace("menu", $m_sci_Nil$(), namespaceConfig$109)
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_LowPri = (function() {
  $c_O.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_LowPri.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_LowPri.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_LowPri;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_LowPri = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_LowPri.prototype = $c_Ljapgolly_scalajs_react_vdom_LowPri.prototype;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Scalatags$ = (function() {
  $c_O.call(this);
  this.stringAttrX$1 = null;
  this.stringStyleX$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Scalatags$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Scalatags$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Scalatags$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Scalatags$.prototype = $c_Ljapgolly_scalajs_react_vdom_Scalatags$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Scalatags$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_Scalatags$ = this;
  var evidence$2 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(s$2) {
    var s = $as_T(s$2);
    return s
  }));
  this.stringAttrX$1 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1) {
    return (function(a$2) {
      return evidence$2$1.apply__O__O(a$2)
    })
  })(evidence$2)));
  this.stringStyleX$1 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$9$2) {
    return $objectToString(x$9$2)
  })));
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Scalatags$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Scalatags$: 0
}, false, "japgolly.scalajs.react.vdom.Scalatags$", {
  Ljapgolly_scalajs_react_vdom_Scalatags$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Scalatags$;
var $n_Ljapgolly_scalajs_react_vdom_Scalatags$ = (void 0);
var $m_Ljapgolly_scalajs_react_vdom_Scalatags$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Scalatags$)) {
    $n_Ljapgolly_scalajs_react_vdom_Scalatags$ = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Scalatags$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$ = (function() {
  $c_O.call(this);
  this.implicitNamespace$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$.prototype = $c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$ = this;
  this.implicitNamespace$1 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1().init___();
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$: 0
}, false, "japgolly.scalajs.react.vdom.Scalatags$NamespaceHtml$", {
  Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$;
var $n_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$ = (void 0);
var $m_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$)) {
    $n_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$ = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$
});
/** @constructor */
var $c_Lorg_scalajs_dom_ext_Ajax$ = (function() {
  $c_O.call(this)
});
$c_Lorg_scalajs_dom_ext_Ajax$.prototype = new $h_O();
$c_Lorg_scalajs_dom_ext_Ajax$.prototype.constructor = $c_Lorg_scalajs_dom_ext_Ajax$;
/** @constructor */
var $h_Lorg_scalajs_dom_ext_Ajax$ = (function() {
  /*<skip>*/
});
$h_Lorg_scalajs_dom_ext_Ajax$.prototype = $c_Lorg_scalajs_dom_ext_Ajax$.prototype;
$c_Lorg_scalajs_dom_ext_Ajax$.prototype.apply__T__T__Lorg_scalajs_dom_ext_Ajax$InputData__I__sci_Map__Z__T__s_concurrent_Future = (function(method, url, data, timeout, headers, withCredentials, responseType) {
  var req = new $g["XMLHttpRequest"]();
  var promise = new $c_s_concurrent_impl_Promise$DefaultPromise().init___();
  req["onreadystatechange"] = (function(req$1, promise$1) {
    return (function(e$2) {
      if (($uI(req$1["readyState"]) === 4)) {
        if (((($uI(req$1["status"]) >= 200) && ($uI(req$1["status"]) < 300)) || ($uI(req$1["status"]) === 304))) {
          return $s_s_concurrent_Promise$class__success__s_concurrent_Promise__O__s_concurrent_Promise(promise$1, req$1)
        } else {
          var cause = new $c_Lorg_scalajs_dom_ext_AjaxException().init___Lorg_scalajs_dom_raw_XMLHttpRequest(req$1);
          return $s_s_concurrent_Promise$class__failure__s_concurrent_Promise__jl_Throwable__s_concurrent_Promise(promise$1, cause)
        }
      } else {
        return (void 0)
      }
    })
  })(req, promise);
  req["open"](method, url);
  req["responseType"] = responseType;
  req["timeout"] = timeout;
  req["withCredentials"] = withCredentials;
  headers.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(req$1$1) {
    return (function(x$2) {
      var x = $as_T2(x$2);
      req$1$1["setRequestHeader"]($as_T(x.$$und1$f), $as_T(x.$$und2$f))
    })
  })(req)));
  req["send"](data);
  return promise
});
var $d_Lorg_scalajs_dom_ext_Ajax$ = new $TypeData().initClass({
  Lorg_scalajs_dom_ext_Ajax$: 0
}, false, "org.scalajs.dom.ext.Ajax$", {
  Lorg_scalajs_dom_ext_Ajax$: 1,
  O: 1
});
$c_Lorg_scalajs_dom_ext_Ajax$.prototype.$classData = $d_Lorg_scalajs_dom_ext_Ajax$;
var $n_Lorg_scalajs_dom_ext_Ajax$ = (void 0);
var $m_Lorg_scalajs_dom_ext_Ajax$ = (function() {
  if ((!$n_Lorg_scalajs_dom_ext_Ajax$)) {
    $n_Lorg_scalajs_dom_ext_Ajax$ = new $c_Lorg_scalajs_dom_ext_Ajax$().init___()
  };
  return $n_Lorg_scalajs_dom_ext_Ajax$
});
/** @constructor */
var $c_jl_Character$ = (function() {
  $c_O.call(this);
  this.TYPE$1 = null;
  this.MIN$undVALUE$1 = 0;
  this.MAX$undVALUE$1 = 0;
  this.SIZE$1 = 0;
  this.MIN$undRADIX$1 = 0;
  this.MAX$undRADIX$1 = 0;
  this.MIN$undHIGH$undSURROGATE$1 = 0;
  this.MAX$undHIGH$undSURROGATE$1 = 0;
  this.MIN$undLOW$undSURROGATE$1 = 0;
  this.MAX$undLOW$undSURROGATE$1 = 0;
  this.MIN$undSURROGATE$1 = 0;
  this.MAX$undSURROGATE$1 = 0;
  this.MIN$undCODE$undPOINT$1 = 0;
  this.MAX$undCODE$undPOINT$1 = 0;
  this.MIN$undSUPPLEMENTARY$undCODE$undPOINT$1 = 0;
  this.HighSurrogateMask$1 = 0;
  this.HighSurrogateID$1 = 0;
  this.LowSurrogateMask$1 = 0;
  this.LowSurrogateID$1 = 0;
  this.SurrogateUsefulPartMask$1 = 0;
  this.reUnicodeIdentStart$1 = null;
  this.reUnicodeIdentPartExcl$1 = null;
  this.reIdentIgnorable$1 = null;
  this.bitmap$0$1 = 0
});
$c_jl_Character$.prototype = new $h_O();
$c_jl_Character$.prototype.constructor = $c_jl_Character$;
/** @constructor */
var $h_jl_Character$ = (function() {
  /*<skip>*/
});
$h_jl_Character$.prototype = $c_jl_Character$.prototype;
$c_jl_Character$.prototype.digit__C__I__I = (function(c, radix) {
  return (((radix > 36) || (radix < 2)) ? (-1) : ((((c >= 48) && (c <= 57)) && ((((-48) + c) | 0) < radix)) ? (((-48) + c) | 0) : ((((c >= 65) && (c <= 90)) && ((((-65) + c) | 0) < (((-10) + radix) | 0))) ? (((-55) + c) | 0) : ((((c >= 97) && (c <= 122)) && ((((-97) + c) | 0) < (((-10) + radix) | 0))) ? (((-87) + c) | 0) : ((((c >= 65313) && (c <= 65338)) && ((((-65313) + c) | 0) < (((-10) + radix) | 0))) ? (((-65303) + c) | 0) : ((((c >= 65345) && (c <= 65370)) && ((((-65345) + c) | 0) < (((-10) + radix) | 0))) ? (((-65303) + c) | 0) : (-1)))))))
});
var $d_jl_Character$ = new $TypeData().initClass({
  jl_Character$: 0
}, false, "java.lang.Character$", {
  jl_Character$: 1,
  O: 1
});
$c_jl_Character$.prototype.$classData = $d_jl_Character$;
var $n_jl_Character$ = (void 0);
var $m_jl_Character$ = (function() {
  if ((!$n_jl_Character$)) {
    $n_jl_Character$ = new $c_jl_Character$().init___()
  };
  return $n_jl_Character$
});
/** @constructor */
var $c_jl_Class = (function() {
  $c_O.call(this);
  this.data$1 = null
});
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
var $h_jl_Class = (function() {
  /*<skip>*/
});
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1["name"])
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1["isPrimitive"])
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === $d_S.getClassOf()) ? (that === $d_B.getClassOf()) : ((this === $d_I.getClassOf()) ? ((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) : ((this === $d_F.getClassOf()) ? (((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) : ((this === $d_D.getClassOf()) && ((((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) || (that === $d_F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
$c_jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return $uZ(this.data$1["isInstance"](obj))
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1["getFakeInstance"]()
});
$c_jl_Class.prototype.isArray__Z = (function() {
  return $uZ(this.data$1["isArrayClass"])
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1["isInterface"])
});
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
var $c_jl_Double$ = (function() {
  $c_O.call(this);
  this.TYPE$1 = null;
  this.POSITIVE$undINFINITY$1 = 0.0;
  this.NEGATIVE$undINFINITY$1 = 0.0;
  this.NaN$1 = 0.0;
  this.MAX$undVALUE$1 = 0.0;
  this.MIN$undVALUE$1 = 0.0;
  this.MAX$undEXPONENT$1 = 0;
  this.MIN$undEXPONENT$1 = 0;
  this.SIZE$1 = 0;
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
});
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
var $h_jl_Double$ = (function() {
  /*<skip>*/
});
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
var $m_jl_Double$ = (function() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
});
/** @constructor */
var $c_jl_Integer$ = (function() {
  $c_O.call(this);
  this.TYPE$1 = null;
  this.MIN$undVALUE$1 = 0;
  this.MAX$undVALUE$1 = 0;
  this.SIZE$1 = 0
});
$c_jl_Integer$.prototype = new $h_O();
$c_jl_Integer$.prototype.constructor = $c_jl_Integer$;
/** @constructor */
var $h_jl_Integer$ = (function() {
  /*<skip>*/
});
$h_jl_Integer$.prototype = $c_jl_Integer$.prototype;
$c_jl_Integer$.prototype.fail$1__p1__T__sr_Nothing$ = (function(s$1) {
  throw new $c_jl_NumberFormatException().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["For input string: \"", "\""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([s$1])))
});
$c_jl_Integer$.prototype.parseInt__T__I__I = (function(s, radix) {
  if ((s === null)) {
    var jsx$1 = true
  } else {
    var this$2 = new $c_sci_StringOps().init___T(s);
    var $$this = this$2.repr$1;
    var jsx$1 = ($uI($$this["length"]) === 0)
  };
  if (((jsx$1 || (radix < 2)) || (radix > 36))) {
    this.fail$1__p1__T__sr_Nothing$(s)
  } else {
    var i = ((((65535 & $uI(s["charCodeAt"](0))) === 45) || ((65535 & $uI(s["charCodeAt"](0))) === 43)) ? 1 : 0);
    var this$12 = new $c_sci_StringOps().init___T(s);
    var $$this$1 = this$12.repr$1;
    if (($uI($$this$1["length"]) <= i)) {
      this.fail$1__p1__T__sr_Nothing$(s)
    } else {
      while (true) {
        var jsx$2 = i;
        var this$16 = new $c_sci_StringOps().init___T(s);
        var $$this$2 = this$16.repr$1;
        if ((jsx$2 < $uI($$this$2["length"]))) {
          var jsx$3 = $m_jl_Character$();
          var index = i;
          if ((jsx$3.digit__C__I__I((65535 & $uI(s["charCodeAt"](index))), radix) < 0)) {
            this.fail$1__p1__T__sr_Nothing$(s)
          };
          i = ((1 + i) | 0)
        } else {
          break
        }
      };
      var res = $uD($g["parseInt"](s, radix));
      return ((((res !== res) || (res > 2147483647)) || (res < (-2147483648))) ? this.fail$1__p1__T__sr_Nothing$(s) : (res | 0))
    }
  }
});
$c_jl_Integer$.prototype.rotateLeft__I__I__I = (function(i, distance) {
  return ((i << distance) | ((i >>> ((-distance) | 0)) | 0))
});
$c_jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return ($imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
$c_jl_Integer$.prototype.reverseBytes__I__I = (function(i) {
  var byte3 = ((i >>> 24) | 0);
  var byte2 = (65280 & ((i >>> 8) | 0));
  var byte1 = (16711680 & (i << 8));
  var byte0 = (i << 24);
  return (((byte0 | byte1) | byte2) | byte3)
});
$c_jl_Integer$.prototype.numberOfLeadingZeros__I__I = (function(i) {
  var x = i;
  x = (x | ((x >>> 1) | 0));
  x = (x | ((x >>> 2) | 0));
  x = (x | ((x >>> 4) | 0));
  x = (x | ((x >>> 8) | 0));
  x = (x | ((x >>> 16) | 0));
  return ((32 - this.bitCount__I__I(x)) | 0)
});
$c_jl_Integer$.prototype.numberOfTrailingZeros__I__I = (function(i) {
  return this.bitCount__I__I((((-1) + (i & ((-i) | 0))) | 0))
});
var $d_jl_Integer$ = new $TypeData().initClass({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1
});
$c_jl_Integer$.prototype.$classData = $d_jl_Integer$;
var $n_jl_Integer$ = (void 0);
var $m_jl_Integer$ = (function() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$().init___()
  };
  return $n_jl_Integer$
});
/** @constructor */
var $c_jl_Number = (function() {
  $c_O.call(this)
});
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
var $h_jl_Number = (function() {
  /*<skip>*/
});
$h_jl_Number.prototype = $c_jl_Number.prototype;
var $is_jl_Number = (function(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
});
var $as_jl_Number = (function(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
});
var $isArrayOf_jl_Number = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
});
var $asArrayOf_jl_Number = (function(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
});
/** @constructor */
var $c_jl_System$ = (function() {
  $c_O.call(this);
  this.out$1 = null;
  this.err$1 = null;
  this.in$1 = null;
  this.getHighPrecisionTime$1 = null
});
$c_jl_System$.prototype = new $h_O();
$c_jl_System$.prototype.constructor = $c_jl_System$;
/** @constructor */
var $h_jl_System$ = (function() {
  /*<skip>*/
});
$h_jl_System$.prototype = $c_jl_System$.prototype;
$c_jl_System$.prototype.init___ = (function() {
  $n_jl_System$ = this;
  this.out$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(false);
  this.err$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(true);
  this.in$1 = null;
  var x = $g["performance"];
  if ($uZ((!(!x)))) {
    var x$1 = $g["performance"]["now"];
    if ($uZ((!(!x$1)))) {
      var jsx$1 = (function(this$2$1) {
        return (function() {
          return $uD($g["performance"]["now"]())
        })
      })(this)
    } else {
      var x$2 = $g["performance"]["webkitNow"];
      if ($uZ((!(!x$2)))) {
        var jsx$1 = (function(this$3$1) {
          return (function() {
            return $uD($g["performance"]["webkitNow"]())
          })
        })(this)
      } else {
        var jsx$1 = (function(this$4$1) {
          return (function() {
            return $uD(new $g["Date"]()["getTime"]())
          })
        })(this)
      }
    }
  } else {
    var jsx$1 = (function(this$5$1) {
      return (function() {
        return $uD(new $g["Date"]()["getTime"]())
      })
    })(this)
  };
  this.getHighPrecisionTime$1 = jsx$1;
  return this
});
var $d_jl_System$ = new $TypeData().initClass({
  jl_System$: 0
}, false, "java.lang.System$", {
  jl_System$: 1,
  O: 1
});
$c_jl_System$.prototype.$classData = $d_jl_System$;
var $n_jl_System$ = (void 0);
var $m_jl_System$ = (function() {
  if ((!$n_jl_System$)) {
    $n_jl_System$ = new $c_jl_System$().init___()
  };
  return $n_jl_System$
});
/** @constructor */
var $c_jl_ThreadLocal = (function() {
  $c_O.call(this);
  this.hasValue$1 = null;
  this.v$1 = null
});
$c_jl_ThreadLocal.prototype = new $h_O();
$c_jl_ThreadLocal.prototype.constructor = $c_jl_ThreadLocal;
/** @constructor */
var $h_jl_ThreadLocal = (function() {
  /*<skip>*/
});
$h_jl_ThreadLocal.prototype = $c_jl_ThreadLocal.prototype;
$c_jl_ThreadLocal.prototype.init___ = (function() {
  this.hasValue$1 = false;
  return this
});
$c_jl_ThreadLocal.prototype.get__O = (function() {
  var x = this.hasValue$1;
  if ((!$uZ(x))) {
    this.set__O__V(this.initialValue__O())
  };
  return this.v$1
});
$c_jl_ThreadLocal.prototype.set__O__V = (function(o) {
  this.v$1 = o;
  this.hasValue$1 = true
});
/** @constructor */
var $c_ju_Arrays$ = (function() {
  $c_O.call(this)
});
$c_ju_Arrays$.prototype = new $h_O();
$c_ju_Arrays$.prototype.constructor = $c_ju_Arrays$;
/** @constructor */
var $h_ju_Arrays$ = (function() {
  /*<skip>*/
});
$h_ju_Arrays$.prototype = $c_ju_Arrays$.prototype;
$c_ju_Arrays$.prototype.fillImpl$mIc$sp__p1__AI__I__V = (function(a, value) {
  var i = 0;
  while ((i !== a.u["length"])) {
    a.u[i] = value;
    i = ((1 + i) | 0)
  }
});
var $d_ju_Arrays$ = new $TypeData().initClass({
  ju_Arrays$: 0
}, false, "java.util.Arrays$", {
  ju_Arrays$: 1,
  O: 1
});
$c_ju_Arrays$.prototype.$classData = $d_ju_Arrays$;
var $n_ju_Arrays$ = (void 0);
var $m_ju_Arrays$ = (function() {
  if ((!$n_ju_Arrays$)) {
    $n_ju_Arrays$ = new $c_ju_Arrays$().init___()
  };
  return $n_ju_Arrays$
});
/** @constructor */
var $c_s_DeprecatedConsole = (function() {
  $c_O.call(this)
});
$c_s_DeprecatedConsole.prototype = new $h_O();
$c_s_DeprecatedConsole.prototype.constructor = $c_s_DeprecatedConsole;
/** @constructor */
var $h_s_DeprecatedConsole = (function() {
  /*<skip>*/
});
$h_s_DeprecatedConsole.prototype = $c_s_DeprecatedConsole.prototype;
/** @constructor */
var $c_s_FallbackArrayBuilding = (function() {
  $c_O.call(this)
});
$c_s_FallbackArrayBuilding.prototype = new $h_O();
$c_s_FallbackArrayBuilding.prototype.constructor = $c_s_FallbackArrayBuilding;
/** @constructor */
var $h_s_FallbackArrayBuilding = (function() {
  /*<skip>*/
});
$h_s_FallbackArrayBuilding.prototype = $c_s_FallbackArrayBuilding.prototype;
/** @constructor */
var $c_s_LowPriorityImplicits = (function() {
  $c_O.call(this)
});
$c_s_LowPriorityImplicits.prototype = new $h_O();
$c_s_LowPriorityImplicits.prototype.constructor = $c_s_LowPriorityImplicits;
/** @constructor */
var $h_s_LowPriorityImplicits = (function() {
  /*<skip>*/
});
$h_s_LowPriorityImplicits.prototype = $c_s_LowPriorityImplicits.prototype;
/** @constructor */
var $c_s_Predef$any2stringadd$ = (function() {
  $c_O.call(this)
});
$c_s_Predef$any2stringadd$.prototype = new $h_O();
$c_s_Predef$any2stringadd$.prototype.constructor = $c_s_Predef$any2stringadd$;
/** @constructor */
var $h_s_Predef$any2stringadd$ = (function() {
  /*<skip>*/
});
$h_s_Predef$any2stringadd$.prototype = $c_s_Predef$any2stringadd$.prototype;
$c_s_Predef$any2stringadd$.prototype.$$plus$extension__O__T__T = (function($$this, other) {
  return (("" + $m_sjsr_RuntimeString$().valueOf__O__T($$this)) + other)
});
var $d_s_Predef$any2stringadd$ = new $TypeData().initClass({
  s_Predef$any2stringadd$: 0
}, false, "scala.Predef$any2stringadd$", {
  s_Predef$any2stringadd$: 1,
  O: 1
});
$c_s_Predef$any2stringadd$.prototype.$classData = $d_s_Predef$any2stringadd$;
var $n_s_Predef$any2stringadd$ = (void 0);
var $m_s_Predef$any2stringadd$ = (function() {
  if ((!$n_s_Predef$any2stringadd$)) {
    $n_s_Predef$any2stringadd$ = new $c_s_Predef$any2stringadd$().init___()
  };
  return $n_s_Predef$any2stringadd$
});
var $s_s_Product2$class__productElement__s_Product2__I__O = (function($$this, n) {
  switch (n) {
    case 0: {
      return $$this.$$und1$f;
      break
    }
    case 1: {
      return $$this.$$und2$f;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
});
var $s_s_Product3$class__productElement__s_Product3__I__O = (function($$this, n) {
  switch (n) {
    case 0: {
      return $$this.$$und1$1;
      break
    }
    case 1: {
      return $$this.$$und2$1;
      break
    }
    case 2: {
      return $$this.$$und3$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
});
var $s_s_Proxy$class__toString__s_Proxy__T = (function($$this) {
  return ("" + $$this.self$1)
});
var $s_s_Proxy$class__equals__s_Proxy__O__Z = (function($$this, that) {
  return ((that !== null) && (((that === $$this) || (that === $$this.self$1)) || $objectEquals(that, $$this.self$1)))
});
/** @constructor */
var $c_s_concurrent_ExecutionContext$Implicits$ = (function() {
  $c_O.call(this);
  this.global$1 = null;
  this.bitmap$0$1 = false
});
$c_s_concurrent_ExecutionContext$Implicits$.prototype = new $h_O();
$c_s_concurrent_ExecutionContext$Implicits$.prototype.constructor = $c_s_concurrent_ExecutionContext$Implicits$;
/** @constructor */
var $h_s_concurrent_ExecutionContext$Implicits$ = (function() {
  /*<skip>*/
});
$h_s_concurrent_ExecutionContext$Implicits$.prototype = $c_s_concurrent_ExecutionContext$Implicits$.prototype;
$c_s_concurrent_ExecutionContext$Implicits$.prototype.global$lzycompute__p1__s_concurrent_ExecutionContextExecutor = (function() {
  if ((!this.bitmap$0$1)) {
    this.global$1 = $m_sjs_concurrent_JSExecutionContext$().queue$1;
    this.bitmap$0$1 = true
  };
  return this.global$1
});
$c_s_concurrent_ExecutionContext$Implicits$.prototype.global__s_concurrent_ExecutionContextExecutor = (function() {
  return ((!this.bitmap$0$1) ? this.global$lzycompute__p1__s_concurrent_ExecutionContextExecutor() : this.global$1)
});
var $d_s_concurrent_ExecutionContext$Implicits$ = new $TypeData().initClass({
  s_concurrent_ExecutionContext$Implicits$: 0
}, false, "scala.concurrent.ExecutionContext$Implicits$", {
  s_concurrent_ExecutionContext$Implicits$: 1,
  O: 1
});
$c_s_concurrent_ExecutionContext$Implicits$.prototype.$classData = $d_s_concurrent_ExecutionContext$Implicits$;
var $n_s_concurrent_ExecutionContext$Implicits$ = (void 0);
var $m_s_concurrent_ExecutionContext$Implicits$ = (function() {
  if ((!$n_s_concurrent_ExecutionContext$Implicits$)) {
    $n_s_concurrent_ExecutionContext$Implicits$ = new $c_s_concurrent_ExecutionContext$Implicits$().init___()
  };
  return $n_s_concurrent_ExecutionContext$Implicits$
});
var $s_s_concurrent_Future$class__foreach__s_concurrent_Future__F1__s_concurrent_ExecutionContext__V = (function($$this, f, executor) {
  $$this.onComplete__F1__s_concurrent_ExecutionContext__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, f$1) {
    return (function(x$1$2) {
      var x$1 = $as_s_util_Try(x$1$2);
      x$1.foreach__F1__V(f$1)
    })
  })($$this, f)), executor)
});
var $s_s_concurrent_Promise$class__success__s_concurrent_Promise__O__s_concurrent_Promise = (function($$this, value) {
  var result = new $c_s_util_Success().init___O(value);
  return $s_s_concurrent_Promise$class__complete__s_concurrent_Promise__s_util_Try__s_concurrent_Promise($$this, result)
});
var $s_s_concurrent_Promise$class__failure__s_concurrent_Promise__jl_Throwable__s_concurrent_Promise = (function($$this, cause) {
  var result = new $c_s_util_Failure().init___jl_Throwable(cause);
  return $s_s_concurrent_Promise$class__complete__s_concurrent_Promise__s_util_Try__s_concurrent_Promise($$this, result)
});
var $s_s_concurrent_Promise$class__complete__s_concurrent_Promise__s_util_Try__s_concurrent_Promise = (function($$this, result) {
  if ($$this.tryComplete__s_util_Try__Z(result)) {
    return $$this
  } else {
    throw new $c_jl_IllegalStateException().init___T("Promise already completed.")
  }
});
/** @constructor */
var $c_s_concurrent_impl_AbstractPromise = (function() {
  $c_O.call(this);
  this.state$1 = null
});
$c_s_concurrent_impl_AbstractPromise.prototype = new $h_O();
$c_s_concurrent_impl_AbstractPromise.prototype.constructor = $c_s_concurrent_impl_AbstractPromise;
/** @constructor */
var $h_s_concurrent_impl_AbstractPromise = (function() {
  /*<skip>*/
});
$h_s_concurrent_impl_AbstractPromise.prototype = $c_s_concurrent_impl_AbstractPromise.prototype;
$c_s_concurrent_impl_AbstractPromise.prototype.updateState__O__O__Z = (function(oldState, newState) {
  if ((this.state$1 === oldState)) {
    this.state$1 = newState;
    return true
  } else {
    return false
  }
});
/** @constructor */
var $c_s_concurrent_impl_Promise$ = (function() {
  $c_O.call(this)
});
$c_s_concurrent_impl_Promise$.prototype = new $h_O();
$c_s_concurrent_impl_Promise$.prototype.constructor = $c_s_concurrent_impl_Promise$;
/** @constructor */
var $h_s_concurrent_impl_Promise$ = (function() {
  /*<skip>*/
});
$h_s_concurrent_impl_Promise$.prototype = $c_s_concurrent_impl_Promise$.prototype;
$c_s_concurrent_impl_Promise$.prototype.scala$concurrent$impl$Promise$$resolveTry__s_util_Try__s_util_Try = (function(source) {
  if ($is_s_util_Failure(source)) {
    var x2 = $as_s_util_Failure(source);
    var t = x2.exception$2;
    return this.resolver__p1__jl_Throwable__s_util_Try(t)
  } else {
    return source
  }
});
$c_s_concurrent_impl_Promise$.prototype.resolver__p1__jl_Throwable__s_util_Try = (function(throwable) {
  if ($is_sr_NonLocalReturnControl(throwable)) {
    var x2 = $as_sr_NonLocalReturnControl(throwable);
    return new $c_s_util_Success().init___O(x2.value__O())
  } else if ($is_s_util_control_ControlThrowable(throwable)) {
    var x3 = $as_s_util_control_ControlThrowable(throwable);
    return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed ControlThrowable", $as_jl_Throwable(x3)))
  } else if ($is_jl_InterruptedException(throwable)) {
    var x4 = $as_jl_InterruptedException(throwable);
    return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed InterruptedException", x4))
  } else if ($is_jl_Error(throwable)) {
    var x5 = $as_jl_Error(throwable);
    return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed Error", x5))
  } else {
    return new $c_s_util_Failure().init___jl_Throwable(throwable)
  }
});
var $d_s_concurrent_impl_Promise$ = new $TypeData().initClass({
  s_concurrent_impl_Promise$: 0
}, false, "scala.concurrent.impl.Promise$", {
  s_concurrent_impl_Promise$: 1,
  O: 1
});
$c_s_concurrent_impl_Promise$.prototype.$classData = $d_s_concurrent_impl_Promise$;
var $n_s_concurrent_impl_Promise$ = (void 0);
var $m_s_concurrent_impl_Promise$ = (function() {
  if ((!$n_s_concurrent_impl_Promise$)) {
    $n_s_concurrent_impl_Promise$ = new $c_s_concurrent_impl_Promise$().init___()
  };
  return $n_s_concurrent_impl_Promise$
});
/** @constructor */
var $c_s_math_Ordered$ = (function() {
  $c_O.call(this)
});
$c_s_math_Ordered$.prototype = new $h_O();
$c_s_math_Ordered$.prototype.constructor = $c_s_math_Ordered$;
/** @constructor */
var $h_s_math_Ordered$ = (function() {
  /*<skip>*/
});
$h_s_math_Ordered$.prototype = $c_s_math_Ordered$.prototype;
var $d_s_math_Ordered$ = new $TypeData().initClass({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
$c_s_math_Ordered$.prototype.$classData = $d_s_math_Ordered$;
var $n_s_math_Ordered$ = (void 0);
var $m_s_math_Ordered$ = (function() {
  if ((!$n_s_math_Ordered$)) {
    $n_s_math_Ordered$ = new $c_s_math_Ordered$().init___()
  };
  return $n_s_math_Ordered$
});
/** @constructor */
var $c_s_package$ = (function() {
  $c_O.call(this);
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.$$hash$colon$colon$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
});
$c_s_package$.prototype = new $h_O();
$c_s_package$.prototype.constructor = $c_s_package$;
/** @constructor */
var $h_s_package$ = (function() {
  /*<skip>*/
});
$h_s_package$.prototype = $c_s_package$.prototype;
$c_s_package$.prototype.init___ = (function() {
  $n_s_package$ = this;
  this.AnyRef$1 = new $c_s_package$$anon$1().init___();
  this.Traversable$1 = $m_sc_Traversable$();
  this.Iterable$1 = $m_sc_Iterable$();
  this.Seq$1 = $m_sc_Seq$();
  this.IndexedSeq$1 = $m_sc_IndexedSeq$();
  this.Iterator$1 = $m_sc_Iterator$();
  this.List$1 = $m_sci_List$();
  this.Nil$1 = $m_sci_Nil$();
  this.$$colon$colon$1 = $m_sci_$colon$colon$();
  this.$$plus$colon$1 = $m_sc_$plus$colon$();
  this.$$colon$plus$1 = $m_sc_$colon$plus$();
  this.Stream$1 = $m_sci_Stream$();
  this.$$hash$colon$colon$1 = $m_sci_Stream$$hash$colon$colon$();
  this.Vector$1 = $m_sci_Vector$();
  this.StringBuilder$1 = $m_scm_StringBuilder$();
  this.Range$1 = $m_sci_Range$();
  this.Equiv$1 = $m_s_math_Equiv$();
  this.Fractional$1 = $m_s_math_Fractional$();
  this.Integral$1 = $m_s_math_Integral$();
  this.Numeric$1 = $m_s_math_Numeric$();
  this.Ordered$1 = $m_s_math_Ordered$();
  this.Ordering$1 = $m_s_math_Ordering$();
  this.Either$1 = $m_s_util_Either$();
  this.Left$1 = $m_s_util_Left$();
  this.Right$1 = $m_s_util_Right$();
  return this
});
var $d_s_package$ = new $TypeData().initClass({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
$c_s_package$.prototype.$classData = $d_s_package$;
var $n_s_package$ = (void 0);
var $m_s_package$ = (function() {
  if ((!$n_s_package$)) {
    $n_s_package$ = new $c_s_package$().init___()
  };
  return $n_s_package$
});
/** @constructor */
var $c_s_reflect_ClassManifestFactory$ = (function() {
  $c_O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyVal$1 = null;
  this.Nothing$1 = null;
  this.Null$1 = null
});
$c_s_reflect_ClassManifestFactory$.prototype = new $h_O();
$c_s_reflect_ClassManifestFactory$.prototype.constructor = $c_s_reflect_ClassManifestFactory$;
/** @constructor */
var $h_s_reflect_ClassManifestFactory$ = (function() {
  /*<skip>*/
});
$h_s_reflect_ClassManifestFactory$.prototype = $c_s_reflect_ClassManifestFactory$.prototype;
$c_s_reflect_ClassManifestFactory$.prototype.init___ = (function() {
  $n_s_reflect_ClassManifestFactory$ = this;
  this.Byte$1 = $m_s_reflect_ManifestFactory$().Byte$1;
  this.Short$1 = $m_s_reflect_ManifestFactory$().Short$1;
  this.Char$1 = $m_s_reflect_ManifestFactory$().Char$1;
  this.Int$1 = $m_s_reflect_ManifestFactory$().Int$1;
  this.Long$1 = $m_s_reflect_ManifestFactory$().Long$1;
  this.Float$1 = $m_s_reflect_ManifestFactory$().Float$1;
  this.Double$1 = $m_s_reflect_ManifestFactory$().Double$1;
  this.Boolean$1 = $m_s_reflect_ManifestFactory$().Boolean$1;
  this.Unit$1 = $m_s_reflect_ManifestFactory$().Unit$1;
  this.Any$1 = $m_s_reflect_ManifestFactory$().Any$1;
  this.Object$1 = $m_s_reflect_ManifestFactory$().Object$1;
  this.AnyVal$1 = $m_s_reflect_ManifestFactory$().AnyVal$1;
  this.Nothing$1 = $m_s_reflect_ManifestFactory$().Nothing$1;
  this.Null$1 = $m_s_reflect_ManifestFactory$().Null$1;
  return this
});
var $d_s_reflect_ClassManifestFactory$ = new $TypeData().initClass({
  s_reflect_ClassManifestFactory$: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  s_reflect_ClassManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ClassManifestFactory$.prototype.$classData = $d_s_reflect_ClassManifestFactory$;
var $n_s_reflect_ClassManifestFactory$ = (void 0);
var $m_s_reflect_ClassManifestFactory$ = (function() {
  if ((!$n_s_reflect_ClassManifestFactory$)) {
    $n_s_reflect_ClassManifestFactory$ = new $c_s_reflect_ClassManifestFactory$().init___()
  };
  return $n_s_reflect_ClassManifestFactory$
});
/** @constructor */
var $c_s_reflect_ManifestFactory$ = (function() {
  $c_O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.scala$reflect$ManifestFactory$$ObjectTYPE$1 = null;
  this.scala$reflect$ManifestFactory$$NothingTYPE$1 = null;
  this.scala$reflect$ManifestFactory$$NullTYPE$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyRef$1 = null;
  this.AnyVal$1 = null;
  this.Null$1 = null;
  this.Nothing$1 = null
});
$c_s_reflect_ManifestFactory$.prototype = new $h_O();
$c_s_reflect_ManifestFactory$.prototype.constructor = $c_s_reflect_ManifestFactory$;
/** @constructor */
var $h_s_reflect_ManifestFactory$ = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$.prototype = $c_s_reflect_ManifestFactory$.prototype;
$c_s_reflect_ManifestFactory$.prototype.init___ = (function() {
  $n_s_reflect_ManifestFactory$ = this;
  this.Byte$1 = new $c_s_reflect_ManifestFactory$$anon$6().init___();
  this.Short$1 = new $c_s_reflect_ManifestFactory$$anon$7().init___();
  this.Char$1 = new $c_s_reflect_ManifestFactory$$anon$8().init___();
  this.Int$1 = new $c_s_reflect_ManifestFactory$$anon$9().init___();
  this.Long$1 = new $c_s_reflect_ManifestFactory$$anon$10().init___();
  this.Float$1 = new $c_s_reflect_ManifestFactory$$anon$11().init___();
  this.Double$1 = new $c_s_reflect_ManifestFactory$$anon$12().init___();
  this.Boolean$1 = new $c_s_reflect_ManifestFactory$$anon$13().init___();
  this.Unit$1 = new $c_s_reflect_ManifestFactory$$anon$14().init___();
  this.scala$reflect$ManifestFactory$$ObjectTYPE$1 = $d_O.getClassOf();
  this.scala$reflect$ManifestFactory$$NothingTYPE$1 = $d_sr_Nothing$.getClassOf();
  this.scala$reflect$ManifestFactory$$NullTYPE$1 = $d_sr_Null$.getClassOf();
  this.Any$1 = new $c_s_reflect_ManifestFactory$$anon$1().init___();
  this.Object$1 = new $c_s_reflect_ManifestFactory$$anon$2().init___();
  this.AnyRef$1 = this.Object$1;
  this.AnyVal$1 = new $c_s_reflect_ManifestFactory$$anon$3().init___();
  this.Null$1 = new $c_s_reflect_ManifestFactory$$anon$4().init___();
  this.Nothing$1 = new $c_s_reflect_ManifestFactory$$anon$5().init___();
  return this
});
var $d_s_reflect_ManifestFactory$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$: 0
}, false, "scala.reflect.ManifestFactory$", {
  s_reflect_ManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ManifestFactory$.prototype.$classData = $d_s_reflect_ManifestFactory$;
var $n_s_reflect_ManifestFactory$ = (void 0);
var $m_s_reflect_ManifestFactory$ = (function() {
  if ((!$n_s_reflect_ManifestFactory$)) {
    $n_s_reflect_ManifestFactory$ = new $c_s_reflect_ManifestFactory$().init___()
  };
  return $n_s_reflect_ManifestFactory$
});
/** @constructor */
var $c_s_reflect_package$ = (function() {
  $c_O.call(this);
  this.ClassManifest$1 = null;
  this.Manifest$1 = null
});
$c_s_reflect_package$.prototype = new $h_O();
$c_s_reflect_package$.prototype.constructor = $c_s_reflect_package$;
/** @constructor */
var $h_s_reflect_package$ = (function() {
  /*<skip>*/
});
$h_s_reflect_package$.prototype = $c_s_reflect_package$.prototype;
$c_s_reflect_package$.prototype.init___ = (function() {
  $n_s_reflect_package$ = this;
  this.ClassManifest$1 = $m_s_reflect_ClassManifestFactory$();
  this.Manifest$1 = $m_s_reflect_ManifestFactory$();
  return this
});
var $d_s_reflect_package$ = new $TypeData().initClass({
  s_reflect_package$: 0
}, false, "scala.reflect.package$", {
  s_reflect_package$: 1,
  O: 1
});
$c_s_reflect_package$.prototype.$classData = $d_s_reflect_package$;
var $n_s_reflect_package$ = (void 0);
var $m_s_reflect_package$ = (function() {
  if ((!$n_s_reflect_package$)) {
    $n_s_reflect_package$ = new $c_s_reflect_package$().init___()
  };
  return $n_s_reflect_package$
});
/** @constructor */
var $c_s_sys_package$ = (function() {
  $c_O.call(this)
});
$c_s_sys_package$.prototype = new $h_O();
$c_s_sys_package$.prototype.constructor = $c_s_sys_package$;
/** @constructor */
var $h_s_sys_package$ = (function() {
  /*<skip>*/
});
$h_s_sys_package$.prototype = $c_s_sys_package$.prototype;
$c_s_sys_package$.prototype.error__T__sr_Nothing$ = (function(message) {
  throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new $c_jl_RuntimeException().init___T(message))
});
var $d_s_sys_package$ = new $TypeData().initClass({
  s_sys_package$: 0
}, false, "scala.sys.package$", {
  s_sys_package$: 1,
  O: 1
});
$c_s_sys_package$.prototype.$classData = $d_s_sys_package$;
var $n_s_sys_package$ = (void 0);
var $m_s_sys_package$ = (function() {
  if ((!$n_s_sys_package$)) {
    $n_s_sys_package$ = new $c_s_sys_package$().init___()
  };
  return $n_s_sys_package$
});
/** @constructor */
var $c_s_util_DynamicVariable = (function() {
  $c_O.call(this);
  this.scala$util$DynamicVariable$$init$f = null;
  this.tl$1 = null
});
$c_s_util_DynamicVariable.prototype = new $h_O();
$c_s_util_DynamicVariable.prototype.constructor = $c_s_util_DynamicVariable;
/** @constructor */
var $h_s_util_DynamicVariable = (function() {
  /*<skip>*/
});
$h_s_util_DynamicVariable.prototype = $c_s_util_DynamicVariable.prototype;
$c_s_util_DynamicVariable.prototype.toString__T = (function() {
  return (("DynamicVariable(" + this.tl$1.get__O()) + ")")
});
$c_s_util_DynamicVariable.prototype.init___O = (function(init) {
  this.scala$util$DynamicVariable$$init$f = init;
  this.tl$1 = new $c_s_util_DynamicVariable$$anon$1().init___s_util_DynamicVariable(this);
  return this
});
var $d_s_util_DynamicVariable = new $TypeData().initClass({
  s_util_DynamicVariable: 0
}, false, "scala.util.DynamicVariable", {
  s_util_DynamicVariable: 1,
  O: 1
});
$c_s_util_DynamicVariable.prototype.$classData = $d_s_util_DynamicVariable;
/** @constructor */
var $c_s_util_Either$ = (function() {
  $c_O.call(this)
});
$c_s_util_Either$.prototype = new $h_O();
$c_s_util_Either$.prototype.constructor = $c_s_util_Either$;
/** @constructor */
var $h_s_util_Either$ = (function() {
  /*<skip>*/
});
$h_s_util_Either$.prototype = $c_s_util_Either$.prototype;
var $d_s_util_Either$ = new $TypeData().initClass({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1
});
$c_s_util_Either$.prototype.$classData = $d_s_util_Either$;
var $n_s_util_Either$ = (void 0);
var $m_s_util_Either$ = (function() {
  if ((!$n_s_util_Either$)) {
    $n_s_util_Either$ = new $c_s_util_Either$().init___()
  };
  return $n_s_util_Either$
});
/** @constructor */
var $c_s_util_Try = (function() {
  $c_O.call(this)
});
$c_s_util_Try.prototype = new $h_O();
$c_s_util_Try.prototype.constructor = $c_s_util_Try;
/** @constructor */
var $h_s_util_Try = (function() {
  /*<skip>*/
});
$h_s_util_Try.prototype = $c_s_util_Try.prototype;
var $is_s_util_Try = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Try)))
});
var $as_s_util_Try = (function(obj) {
  return (($is_s_util_Try(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Try"))
});
var $isArrayOf_s_util_Try = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Try)))
});
var $asArrayOf_s_util_Try = (function(obj, depth) {
  return (($isArrayOf_s_util_Try(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Try;", depth))
});
/** @constructor */
var $c_s_util_control_Breaks = (function() {
  $c_O.call(this);
  this.scala$util$control$Breaks$$breakException$1 = null
});
$c_s_util_control_Breaks.prototype = new $h_O();
$c_s_util_control_Breaks.prototype.constructor = $c_s_util_control_Breaks;
/** @constructor */
var $h_s_util_control_Breaks = (function() {
  /*<skip>*/
});
$h_s_util_control_Breaks.prototype = $c_s_util_control_Breaks.prototype;
$c_s_util_control_Breaks.prototype.init___ = (function() {
  this.scala$util$control$Breaks$$breakException$1 = new $c_s_util_control_BreakControl().init___();
  return this
});
var $d_s_util_control_Breaks = new $TypeData().initClass({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
$c_s_util_control_Breaks.prototype.$classData = $d_s_util_control_Breaks;
var $is_s_util_control_ControlThrowable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_control_ControlThrowable)))
});
var $as_s_util_control_ControlThrowable = (function(obj) {
  return (($is_s_util_control_ControlThrowable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.control.ControlThrowable"))
});
var $isArrayOf_s_util_control_ControlThrowable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_control_ControlThrowable)))
});
var $asArrayOf_s_util_control_ControlThrowable = (function(obj, depth) {
  return (($isArrayOf_s_util_control_ControlThrowable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.control.ControlThrowable;", depth))
});
var $s_s_util_control_NoStackTrace$class__fillInStackTrace__s_util_control_NoStackTrace__jl_Throwable = (function($$this) {
  var this$1 = $m_s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $$this.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable()
  } else {
    return $as_jl_Throwable($$this)
  }
});
/** @constructor */
var $c_s_util_control_NonFatal$ = (function() {
  $c_O.call(this)
});
$c_s_util_control_NonFatal$.prototype = new $h_O();
$c_s_util_control_NonFatal$.prototype.constructor = $c_s_util_control_NonFatal$;
/** @constructor */
var $h_s_util_control_NonFatal$ = (function() {
  /*<skip>*/
});
$h_s_util_control_NonFatal$.prototype = $c_s_util_control_NonFatal$.prototype;
$c_s_util_control_NonFatal$.prototype.apply__jl_Throwable__Z = (function(t) {
  return (!($is_jl_VirtualMachineError(t) || ($is_jl_ThreadDeath(t) || ($is_jl_InterruptedException(t) || ($is_jl_LinkageError(t) || $is_s_util_control_ControlThrowable(t))))))
});
$c_s_util_control_NonFatal$.prototype.unapply__jl_Throwable__s_Option = (function(t) {
  return (this.apply__jl_Throwable__Z(t) ? new $c_s_Some().init___O(t) : $m_s_None$())
});
var $d_s_util_control_NonFatal$ = new $TypeData().initClass({
  s_util_control_NonFatal$: 0
}, false, "scala.util.control.NonFatal$", {
  s_util_control_NonFatal$: 1,
  O: 1
});
$c_s_util_control_NonFatal$.prototype.$classData = $d_s_util_control_NonFatal$;
var $n_s_util_control_NonFatal$ = (void 0);
var $m_s_util_control_NonFatal$ = (function() {
  if ((!$n_s_util_control_NonFatal$)) {
    $n_s_util_control_NonFatal$ = new $c_s_util_control_NonFatal$().init___()
  };
  return $n_s_util_control_NonFatal$
});
/** @constructor */
var $c_s_util_hashing_MurmurHash3 = (function() {
  $c_O.call(this)
});
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
var $h_s_util_hashing_MurmurHash3 = (function() {
  /*<skip>*/
});
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  k = $m_jl_Integer$().rotateLeft__I__I__I(k, 15);
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  h = $m_jl_Integer$().rotateLeft__I__I__I(h, 13);
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var a = new $c_sr_IntRef().init___I(0);
  var b = new $c_sr_IntRef().init___I(0);
  var n = new $c_sr_IntRef().init___I(0);
  var c = new $c_sr_IntRef().init___I(1);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, a$1, b$1, n$1, c$1) {
    return (function(x$2) {
      var h = $m_sr_ScalaRunTime$().hash__O__I(x$2);
      a$1.elem$1 = ((a$1.elem$1 + h) | 0);
      b$1.elem$1 = (b$1.elem$1 ^ h);
      if ((h !== 0)) {
        c$1.elem$1 = $imul(c$1.elem$1, h)
      };
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, a, b, n, c)));
  var h$1 = seed;
  h$1 = this.mix__I__I__I(h$1, a.elem$1);
  h$1 = this.mix__I__I__I(h$1, b.elem$1);
  h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
  return this.finalizeHash__I__I__I(h$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_ScalaRunTime$().hash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
$c_s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new $c_sr_IntRef().init___I(0);
  var h = new $c_sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, n$1, h$1) {
    return (function(x$2) {
      h$1.elem$1 = this$2$1.mix__I__I__I(h$1.elem$1, $m_sr_ScalaRunTime$().hash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, n, h)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var this$1 = elems;
    var tail = this$1.tail__sci_List();
    h = this.mix__I__I__I(h, $m_sr_ScalaRunTime$().hash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
/** @constructor */
var $c_s_util_hashing_package$ = (function() {
  $c_O.call(this)
});
$c_s_util_hashing_package$.prototype = new $h_O();
$c_s_util_hashing_package$.prototype.constructor = $c_s_util_hashing_package$;
/** @constructor */
var $h_s_util_hashing_package$ = (function() {
  /*<skip>*/
});
$h_s_util_hashing_package$.prototype = $c_s_util_hashing_package$.prototype;
$c_s_util_hashing_package$.prototype.byteswap32__I__I = (function(v) {
  var hc = $imul((-1640532531), v);
  hc = $m_jl_Integer$().reverseBytes__I__I(hc);
  return $imul((-1640532531), hc)
});
var $d_s_util_hashing_package$ = new $TypeData().initClass({
  s_util_hashing_package$: 0
}, false, "scala.util.hashing.package$", {
  s_util_hashing_package$: 1,
  O: 1
});
$c_s_util_hashing_package$.prototype.$classData = $d_s_util_hashing_package$;
var $n_s_util_hashing_package$ = (void 0);
var $m_s_util_hashing_package$ = (function() {
  if ((!$n_s_util_hashing_package$)) {
    $n_s_util_hashing_package$ = new $c_s_util_hashing_package$().init___()
  };
  return $n_s_util_hashing_package$
});
/** @constructor */
var $c_sc_$colon$plus$ = (function() {
  $c_O.call(this)
});
$c_sc_$colon$plus$.prototype = new $h_O();
$c_sc_$colon$plus$.prototype.constructor = $c_sc_$colon$plus$;
/** @constructor */
var $h_sc_$colon$plus$ = (function() {
  /*<skip>*/
});
$h_sc_$colon$plus$.prototype = $c_sc_$colon$plus$.prototype;
var $d_sc_$colon$plus$ = new $TypeData().initClass({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
$c_sc_$colon$plus$.prototype.$classData = $d_sc_$colon$plus$;
var $n_sc_$colon$plus$ = (void 0);
var $m_sc_$colon$plus$ = (function() {
  if ((!$n_sc_$colon$plus$)) {
    $n_sc_$colon$plus$ = new $c_sc_$colon$plus$().init___()
  };
  return $n_sc_$colon$plus$
});
/** @constructor */
var $c_sc_$plus$colon$ = (function() {
  $c_O.call(this)
});
$c_sc_$plus$colon$.prototype = new $h_O();
$c_sc_$plus$colon$.prototype.constructor = $c_sc_$plus$colon$;
/** @constructor */
var $h_sc_$plus$colon$ = (function() {
  /*<skip>*/
});
$h_sc_$plus$colon$.prototype = $c_sc_$plus$colon$.prototype;
var $d_sc_$plus$colon$ = new $TypeData().initClass({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
$c_sc_$plus$colon$.prototype.$classData = $d_sc_$plus$colon$;
var $n_sc_$plus$colon$ = (void 0);
var $m_sc_$plus$colon$ = (function() {
  if ((!$n_sc_$plus$colon$)) {
    $n_sc_$plus$colon$ = new $c_sc_$plus$colon$().init___()
  };
  return $n_sc_$plus$colon$
});
var $s_sc_GenMapLike$class__liftedTree1$1__p0__sc_GenMapLike__sc_GenMap__Z = (function($$this, x2$1) {
  try {
    var this$1 = $$this.iterator__sc_Iterator();
    var res = true;
    while ((res && this$1.hasNext__Z())) {
      var arg1 = this$1.next__O();
      var x0$1 = $as_T2(arg1);
      if ((x0$1 !== null)) {
        var k = x0$1.$$und1$f;
        var v = x0$1.$$und2$f;
        var x1$2 = x2$1.get__O__s_Option(k);
        matchEnd6: {
          if ($is_s_Some(x1$2)) {
            var x2 = $as_s_Some(x1$2);
            var p3 = x2.x$2;
            if ($m_sr_BoxesRunTime$().equals__O__O__Z(v, p3)) {
              res = true;
              break matchEnd6
            }
          };
          res = false;
          break matchEnd6
        }
      } else {
        throw new $c_s_MatchError().init___O(x0$1)
      }
    };
    return res
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      var this$3 = $m_s_Console$();
      var this$4 = this$3.outVar$2;
      $as_Ljava_io_PrintStream(this$4.tl$1.get__O()).println__O__V("class cast ");
      return false
    } else {
      throw e
    }
  }
});
var $s_sc_GenMapLike$class__equals__sc_GenMapLike__O__Z = (function($$this, that) {
  if ($is_sc_GenMap(that)) {
    var x2 = $as_sc_GenMap(that);
    return (($$this === x2) || (($$this.size__I() === x2.size__I()) && $s_sc_GenMapLike$class__liftedTree1$1__p0__sc_GenMapLike__sc_GenMap__Z($$this, x2)))
  } else {
    return false
  }
});
var $s_sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z = (function($$this, that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return $$this.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
});
var $s_sc_GenSetLike$class__liftedTree1$1__p0__sc_GenSetLike__sc_GenSet__Z = (function($$this, x2$1) {
  try {
    return $$this.subsetOf__sc_GenSet__Z(x2$1)
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
});
var $s_sc_GenSetLike$class__equals__sc_GenSetLike__O__Z = (function($$this, that) {
  if ($is_sc_GenSet(that)) {
    var x2 = $as_sc_GenSet(that);
    return (($$this === x2) || (($$this.size__I() === x2.size__I()) && $s_sc_GenSetLike$class__liftedTree1$1__p0__sc_GenSetLike__sc_GenSet__Z($$this, x2)))
  } else {
    return false
  }
});
var $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I = (function($$this, len) {
  return (($$this.length__I() - len) | 0)
});
var $s_sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V = (function($$this, xs, start, len) {
  var i = 0;
  var j = start;
  var $$this$1 = $$this.length__I();
  var $$this$2 = (($$this$1 < len) ? $$this$1 : len);
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = (($$this$2 < that) ? $$this$2 : that);
  while ((i < end)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $$this.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
var $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z = (function($$this, that) {
  if ($is_sc_IndexedSeq(that)) {
    var x2 = $as_sc_IndexedSeq(that);
    var len = $$this.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && $m_sr_BoxesRunTime$().equals__O__O__Z($$this.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return $s_sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
});
var $s_sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O = (function($$this) {
  var b = $$this.newBuilder__scm_Builder();
  b.sizeHint__I__V($$this.length__I());
  var i = $$this.length__I();
  while ((i > 0)) {
    i = (((-1) + i) | 0);
    b.$$plus$eq__O__scm_Builder($$this.apply__I__O(i))
  };
  return b.result__O()
});
var $s_sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V = (function($$this, f) {
  var i = 0;
  var len = $$this.length__I();
  while ((i < len)) {
    f.apply__O__O($$this.apply__I__O(i));
    i = ((1 + i) | 0)
  }
});
var $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z = (function($$this) {
  return ($$this.length__I() === 0)
});
var $s_sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V = (function($$this, xs, start, len) {
  var i = start;
  var $$this$1 = ((start + len) | 0);
  var that = $m_sr_ScalaRunTime$().array$undlength__O__I(xs);
  var end = (($$this$1 < that) ? $$this$1 : that);
  var it = $$this.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
});
var $s_sc_IterableLike$class__take__sc_IterableLike__I__O = (function($$this, n) {
  var b = $$this.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    b.sizeHintBounded__I__sc_TraversableLike__V(n, $$this);
    var i = 0;
    var it = $$this.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
});
var $s_sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z = (function($$this, that) {
  var these = $$this.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
});
var $s_sc_IterableLike$class__zipWithIndex__sc_IterableLike__scg_CanBuildFrom__O = (function($$this, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  var i = new $c_sr_IntRef().init___I(0);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1, i$1) {
    return (function(x$2) {
      b$1.$$plus$eq__O__scm_Builder(new $c_T2().init___O__O(x$2, i$1.elem$1));
      i$1.elem$1 = ((1 + i$1.elem$1) | 0)
    })
  })($$this, b, i)));
  return b.result__O()
});
/** @constructor */
var $c_sc_Iterator$ = (function() {
  $c_O.call(this);
  this.empty$1 = null
});
$c_sc_Iterator$.prototype = new $h_O();
$c_sc_Iterator$.prototype.constructor = $c_sc_Iterator$;
/** @constructor */
var $h_sc_Iterator$ = (function() {
  /*<skip>*/
});
$h_sc_Iterator$.prototype = $c_sc_Iterator$.prototype;
$c_sc_Iterator$.prototype.init___ = (function() {
  $n_sc_Iterator$ = this;
  this.empty$1 = new $c_sc_Iterator$$anon$2().init___();
  return this
});
var $d_sc_Iterator$ = new $TypeData().initClass({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
$c_sc_Iterator$.prototype.$classData = $d_sc_Iterator$;
var $n_sc_Iterator$ = (void 0);
var $m_sc_Iterator$ = (function() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$().init___()
  };
  return $n_sc_Iterator$
});
var $s_sc_Iterator$class__toStream__sc_Iterator__sci_Stream = (function($$this) {
  if ($$this.hasNext__Z()) {
    var hd = $$this.next__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($$this$1) {
      return (function() {
        return $$this$1.toStream__sci_Stream()
      })
    })($$this));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
  }
});
var $s_sc_Iterator$class__isEmpty__sc_Iterator__Z = (function($$this) {
  return (!$$this.hasNext__Z())
});
var $s_sc_Iterator$class__toString__sc_Iterator__T = (function($$this) {
  return (($$this.hasNext__Z() ? "non-empty" : "empty") + " iterator")
});
var $s_sc_Iterator$class__foreach__sc_Iterator__F1__V = (function($$this, f) {
  while ($$this.hasNext__Z()) {
    f.apply__O__O($$this.next__O())
  }
});
var $s_sc_Iterator$class__forall__sc_Iterator__F1__Z = (function($$this, p) {
  var res = true;
  while ((res && $$this.hasNext__Z())) {
    res = $uZ(p.apply__O__O($$this.next__O()))
  };
  return res
});
var $s_sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I = (function($$this, len) {
  return ((len < 0) ? 1 : $s_sc_LinearSeqOptimized$class__loop$1__p0__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($$this, 0, $$this, len))
});
var $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O = (function($$this, n) {
  var rest = $$this.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
});
var $s_sc_LinearSeqOptimized$class__loop$1__p0__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I = (function($$this, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = $as_sc_LinearSeqOptimized(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
});
var $s_sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I = (function($$this) {
  var these = $$this;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return len
});
var $s_sc_LinearSeqOptimized$class__last__sc_LinearSeqOptimized__O = (function($$this) {
  if ($$this.isEmpty__Z()) {
    throw new $c_ju_NoSuchElementException().init___()
  };
  var these = $$this;
  var nx = $as_sc_LinearSeqOptimized(these.tail__O());
  while ((!nx.isEmpty__Z())) {
    these = nx;
    nx = $as_sc_LinearSeqOptimized(nx.tail__O())
  };
  return these.head__O()
});
var $s_sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z = (function($$this, that) {
  if ($is_sc_LinearSeq(that)) {
    var x2 = $as_sc_LinearSeq(that);
    if (($$this === x2)) {
      return true
    } else {
      var these = $$this;
      var those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && $m_sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = $as_sc_LinearSeqOptimized(these.tail__O());
        those = $as_sc_LinearSeq(those.tail__O())
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return $s_sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
});
var $s_sc_MapLike$class__addString__sc_MapLike__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($$this, b, start, sep, end) {
  var this$2 = $$this.iterator__sc_Iterator();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1) {
    return (function(x0$1$2) {
      var x0$1 = $as_T2(x0$1$2);
      if ((x0$1 !== null)) {
        var k = x0$1.$$und1$f;
        var v = x0$1.$$und2$f;
        return (("" + $m_s_Predef$any2stringadd$().$$plus$extension__O__T__T(k, " -> ")) + v)
      } else {
        throw new $c_s_MatchError().init___O(x0$1)
      }
    })
  })($$this));
  var this$3 = new $c_sc_Iterator$$anon$11().init___sc_Iterator__F1(this$2, f);
  return $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this$3, b, start, sep, end)
});
var $s_sc_MapLike$class__apply__sc_MapLike__O__O = (function($$this, key) {
  var x1 = $$this.get__O__s_Option(key);
  var x = $m_s_None$();
  if ((x === x1)) {
    return $s_sc_MapLike$class__$default__sc_MapLike__O__O($$this, key)
  } else if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var value = x2.x$2;
    return value
  } else {
    throw new $c_s_MatchError().init___O(x1)
  }
});
var $s_sc_MapLike$class__isEmpty__sc_MapLike__Z = (function($$this) {
  return ($$this.size__I() === 0)
});
var $s_sc_MapLike$class__contains__sc_MapLike__O__Z = (function($$this, key) {
  return $$this.get__O__s_Option(key).isDefined__Z()
});
var $s_sc_MapLike$class__$default__sc_MapLike__O__O = (function($$this, key) {
  throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
});
var $s_sc_SeqLike$class__isEmpty__sc_SeqLike__Z = (function($$this) {
  return ($$this.lengthCompare__I__I(0) === 0)
});
var $s_sc_SeqLike$class__reverse__sc_SeqLike__O = (function($$this) {
  var elem = $m_sci_Nil$();
  var xs = new $c_sr_ObjectRef().init___O(elem);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, xs$1) {
    return (function(x$2) {
      var this$2 = $as_sci_List(xs$1.elem$1);
      xs$1.elem$1 = new $c_sci_$colon$colon().init___O__sci_List(x$2, this$2)
    })
  })($$this, xs)));
  var b = $$this.newBuilder__scm_Builder();
  $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  var this$3 = $as_sci_List(xs.elem$1);
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    b.$$plus$eq__O__scm_Builder(arg1);
    var this$4 = these;
    these = this$4.tail__sci_List()
  };
  return b.result__O()
});
var $s_sc_SeqLike$class__reverseIterator__sc_SeqLike__sc_Iterator = (function($$this) {
  return $$this.toCollection__O__sc_Seq($$this.reverse__O()).iterator__sc_Iterator()
});
var $s_sc_SetLike$class__isEmpty__sc_SetLike__Z = (function($$this) {
  return ($$this.size__I() === 0)
});
var $s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O = (function($$this, cbf) {
  var b = cbf.apply__scm_Builder();
  $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Traversable());
  return b.result__O()
});
var $s_sc_TraversableLike$class__toString__sc_TraversableLike__T = (function($$this) {
  return $$this.mkString__T__T__T__T(($$this.stringPrefix__T() + "("), ", ", ")")
});
var $s_sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O = (function($$this, f, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1, f$1) {
    return (function(x$2) {
      return $as_scm_Builder(b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($as_sc_GenTraversableOnce(f$1.apply__O__O(x$2)).seq__sc_TraversableOnce()))
    })
  })($$this, b, f)));
  return b.result__O()
});
var $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O = (function($$this, f, bf) {
  var b = $s_sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder($$this, bf);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1, f$1) {
    return (function(x$2) {
      return b$1.$$plus$eq__O__scm_Builder(f$1.apply__O__O(x$2))
    })
  })($$this, b, f)));
  return b.result__O()
});
var $s_sc_TraversableLike$class__$$plus$plus__sc_TraversableLike__sc_GenTraversableOnce__scg_CanBuildFrom__O = (function($$this, that, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  if ($is_sc_IndexedSeqLike(that)) {
    var delta = that.seq__sc_TraversableOnce().size__I();
    $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__I__V(b, $$this, delta)
  };
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Traversable());
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(that.seq__sc_TraversableOnce());
  return b.result__O()
});
var $s_sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder = (function($$this, bf$1) {
  var b = bf$1.apply__O__scm_Builder($$this.repr__O());
  $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  return b
});
var $s_sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T = (function($$this) {
  var string = $objectGetClass($$this.repr__O()).getName__T();
  var idx1 = $m_sjsr_RuntimeString$().lastIndexOf__T__I__I(string, 46);
  if ((idx1 !== (-1))) {
    var thiz = string;
    var beginIndex = ((1 + idx1) | 0);
    string = $as_T(thiz["substring"](beginIndex))
  };
  var idx2 = $m_sjsr_RuntimeString$().indexOf__T__I__I(string, 36);
  if ((idx2 !== (-1))) {
    var thiz$1 = string;
    string = $as_T(thiz$1["substring"](0, idx2))
  };
  return string
});
var $is_sc_TraversableOnce = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
});
var $as_sc_TraversableOnce = (function(obj) {
  return (($is_sc_TraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.TraversableOnce"))
});
var $isArrayOf_sc_TraversableOnce = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
});
var $asArrayOf_sc_TraversableOnce = (function(obj, depth) {
  return (($isArrayOf_sc_TraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.TraversableOnce;", depth))
});
var $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($$this, b, start, sep, end) {
  var first = new $c_sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, first$1, b$1, sep$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($$this, first, b, sep)));
  b.append__T__scm_StringBuilder(end);
  return b
});
var $s_sc_TraversableOnce$class__to__sc_TraversableOnce__scg_CanBuildFrom__O = (function($$this, cbf) {
  var b = cbf.apply__scm_Builder();
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.seq__sc_TraversableOnce());
  return b.result__O()
});
var $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T = (function($$this, start, sep, end) {
  var this$1 = $$this.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new $c_scm_StringBuilder().init___(), start, sep, end);
  var this$2 = this$1.underlying$5;
  return this$2.content$1
});
var $s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z = (function($$this) {
  return (!$$this.isEmpty__Z())
});
var $s_sc_TraversableOnce$class__size__sc_TraversableOnce__I = (function($$this) {
  var result = new $c_sr_IntRef().init___I(0);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, result$1) {
    return (function(x$2) {
      result$1.elem$1 = ((1 + result$1.elem$1) | 0)
    })
  })($$this, result)));
  return result.elem$1
});
/** @constructor */
var $c_scg_GenMapFactory = (function() {
  $c_O.call(this)
});
$c_scg_GenMapFactory.prototype = new $h_O();
$c_scg_GenMapFactory.prototype.constructor = $c_scg_GenMapFactory;
/** @constructor */
var $h_scg_GenMapFactory = (function() {
  /*<skip>*/
});
$h_scg_GenMapFactory.prototype = $c_scg_GenMapFactory.prototype;
/** @constructor */
var $c_scg_GenericCompanion = (function() {
  $c_O.call(this)
});
$c_scg_GenericCompanion.prototype = new $h_O();
$c_scg_GenericCompanion.prototype.constructor = $c_scg_GenericCompanion;
/** @constructor */
var $h_scg_GenericCompanion = (function() {
  /*<skip>*/
});
$h_scg_GenericCompanion.prototype = $c_scg_GenericCompanion.prototype;
var $is_scg_Growable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scg_Growable)))
});
var $as_scg_Growable = (function(obj) {
  return (($is_scg_Growable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.generic.Growable"))
});
var $isArrayOf_scg_Growable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scg_Growable)))
});
var $asArrayOf_scg_Growable = (function(obj, depth) {
  return (($isArrayOf_scg_Growable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.generic.Growable;", depth))
});
var $s_scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V = (function($$this, xs) {
  x: {
    _loop: while (true) {
      var this$1 = xs;
      if ($s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
        $$this.$$plus$eq__O__scg_Growable(xs.head__O());
        xs = $as_sc_LinearSeq(xs.tail__O());
        continue _loop
      };
      break x
    }
  }
});
var $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable = (function($$this, xs) {
  if ($is_sc_LinearSeq(xs)) {
    var x2 = $as_sc_LinearSeq(xs);
    $s_scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V($$this, x2)
  } else {
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1) {
      return (function(elem$2) {
        return $$this$1.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($$this)))
  };
  return $$this
});
/** @constructor */
var $c_sci_HashMap$Merger = (function() {
  $c_O.call(this)
});
$c_sci_HashMap$Merger.prototype = new $h_O();
$c_sci_HashMap$Merger.prototype.constructor = $c_sci_HashMap$Merger;
/** @constructor */
var $h_sci_HashMap$Merger = (function() {
  /*<skip>*/
});
$h_sci_HashMap$Merger.prototype = $c_sci_HashMap$Merger.prototype;
/** @constructor */
var $c_sci_Stream$$hash$colon$colon$ = (function() {
  $c_O.call(this)
});
$c_sci_Stream$$hash$colon$colon$.prototype = new $h_O();
$c_sci_Stream$$hash$colon$colon$.prototype.constructor = $c_sci_Stream$$hash$colon$colon$;
/** @constructor */
var $h_sci_Stream$$hash$colon$colon$ = (function() {
  /*<skip>*/
});
$h_sci_Stream$$hash$colon$colon$.prototype = $c_sci_Stream$$hash$colon$colon$.prototype;
var $d_sci_Stream$$hash$colon$colon$ = new $TypeData().initClass({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
$c_sci_Stream$$hash$colon$colon$.prototype.$classData = $d_sci_Stream$$hash$colon$colon$;
var $n_sci_Stream$$hash$colon$colon$ = (void 0);
var $m_sci_Stream$$hash$colon$colon$ = (function() {
  if ((!$n_sci_Stream$$hash$colon$colon$)) {
    $n_sci_Stream$$hash$colon$colon$ = new $c_sci_Stream$$hash$colon$colon$().init___()
  };
  return $n_sci_Stream$$hash$colon$colon$
});
/** @constructor */
var $c_sci_Stream$ConsWrapper = (function() {
  $c_O.call(this);
  this.tl$1 = null
});
$c_sci_Stream$ConsWrapper.prototype = new $h_O();
$c_sci_Stream$ConsWrapper.prototype.constructor = $c_sci_Stream$ConsWrapper;
/** @constructor */
var $h_sci_Stream$ConsWrapper = (function() {
  /*<skip>*/
});
$h_sci_Stream$ConsWrapper.prototype = $c_sci_Stream$ConsWrapper.prototype;
$c_sci_Stream$ConsWrapper.prototype.init___F0 = (function(tl) {
  this.tl$1 = tl;
  return this
});
$c_sci_Stream$ConsWrapper.prototype.$$hash$colon$colon__O__sci_Stream = (function(hd) {
  var tl = this.tl$1;
  return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
});
var $d_sci_Stream$ConsWrapper = new $TypeData().initClass({
  sci_Stream$ConsWrapper: 0
}, false, "scala.collection.immutable.Stream$ConsWrapper", {
  sci_Stream$ConsWrapper: 1,
  O: 1
});
$c_sci_Stream$ConsWrapper.prototype.$classData = $d_sci_Stream$ConsWrapper;
/** @constructor */
var $c_sci_StreamIterator$LazyCell = (function() {
  $c_O.call(this);
  this.st$1 = null;
  this.v$1 = null;
  this.$$outer$f = null;
  this.bitmap$0$1 = false
});
$c_sci_StreamIterator$LazyCell.prototype = new $h_O();
$c_sci_StreamIterator$LazyCell.prototype.constructor = $c_sci_StreamIterator$LazyCell;
/** @constructor */
var $h_sci_StreamIterator$LazyCell = (function() {
  /*<skip>*/
});
$h_sci_StreamIterator$LazyCell.prototype = $c_sci_StreamIterator$LazyCell.prototype;
$c_sci_StreamIterator$LazyCell.prototype.init___sci_StreamIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
$c_sci_StreamIterator$LazyCell.prototype.v$lzycompute__p1__sci_Stream = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = $as_sci_Stream(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
$c_sci_StreamIterator$LazyCell.prototype.v__sci_Stream = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
});
var $d_sci_StreamIterator$LazyCell = new $TypeData().initClass({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
$c_sci_StreamIterator$LazyCell.prototype.$classData = $d_sci_StreamIterator$LazyCell;
/** @constructor */
var $c_sci_StringOps$ = (function() {
  $c_O.call(this)
});
$c_sci_StringOps$.prototype = new $h_O();
$c_sci_StringOps$.prototype.constructor = $c_sci_StringOps$;
/** @constructor */
var $h_sci_StringOps$ = (function() {
  /*<skip>*/
});
$h_sci_StringOps$.prototype = $c_sci_StringOps$.prototype;
$c_sci_StringOps$.prototype.equals$extension__T__O__Z = (function($$this, x$1) {
  if ($is_sci_StringOps(x$1)) {
    var StringOps$1 = ((x$1 === null) ? null : $as_sci_StringOps(x$1).repr$1);
    return ($$this === StringOps$1)
  } else {
    return false
  }
});
var $d_sci_StringOps$ = new $TypeData().initClass({
  sci_StringOps$: 0
}, false, "scala.collection.immutable.StringOps$", {
  sci_StringOps$: 1,
  O: 1
});
$c_sci_StringOps$.prototype.$classData = $d_sci_StringOps$;
var $n_sci_StringOps$ = (void 0);
var $m_sci_StringOps$ = (function() {
  if ((!$n_sci_StringOps$)) {
    $n_sci_StringOps$ = new $c_sci_StringOps$().init___()
  };
  return $n_sci_StringOps$
});
var $s_sci_VectorPointer$class__getElem__sci_VectorPointer__I__I__O = (function($$this, index, xor) {
  if ((xor < 32)) {
    return $$this.display0__AO().u[(31 & index)]
  } else if ((xor < 1024)) {
    return $asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 32768)) {
    return $asArrayOf_O($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1048576)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 33554432)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($$this.display4__AO().u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1073741824)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($$this.display5__AO().u[(31 & (index >> 25))], 1).u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
});
var $s_sci_VectorPointer$class__gotoNextBlockStartWritable__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor < 1024)) {
    if (($$this.depth__I() === 1)) {
      $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display1__AO().u[0] = $$this.display0__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO()
  } else if ((xor < 32768)) {
    if (($$this.depth__I() === 2)) {
      $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display2__AO().u[0] = $$this.display1__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO()
  } else if ((xor < 1048576)) {
    if (($$this.depth__I() === 3)) {
      $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display3__AO().u[0] = $$this.display2__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO()
  } else if ((xor < 33554432)) {
    if (($$this.depth__I() === 4)) {
      $$this.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display4__AO().u[0] = $$this.display3__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO()
  } else if ((xor < 1073741824)) {
    if (($$this.depth__I() === 5)) {
      $$this.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display5__AO().u[0] = $$this.display4__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
    $$this.display5__AO().u[(31 & (index >> 25))] = $$this.display4__AO()
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
});
var $s_sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V = (function($$this, index) {
  var x1 = (((-1) + $$this.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $$this.display5__AO();
      $$this.display5$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a));
      var a$1 = $$this.display4__AO();
      $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$1));
      var a$2 = $$this.display3__AO();
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$2));
      var a$3 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$3));
      var a$4 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$4));
      $$this.display5__AO().u[(31 & (index >> 25))] = $$this.display4__AO();
      $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
      $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
      $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 4: {
      var a$5 = $$this.display4__AO();
      $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$5));
      var a$6 = $$this.display3__AO();
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$6));
      var a$7 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$7));
      var a$8 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$8));
      $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
      $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
      $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 3: {
      var a$9 = $$this.display3__AO();
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$9));
      var a$10 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$10));
      var a$11 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$11));
      $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
      $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 2: {
      var a$12 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$12));
      var a$13 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$13));
      $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 1: {
      var a$14 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$14));
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 0: {
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
var $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V = (function($$this, that, depth) {
  $$this.depth$und$eq__I__V(depth);
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1): {
      break
    }
    case 0: {
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 1: {
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 2: {
      $$this.display2$und$eq__AO__V(that.display2__AO());
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 3: {
      $$this.display3$und$eq__AO__V(that.display3__AO());
      $$this.display2$und$eq__AO__V(that.display2__AO());
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 4: {
      $$this.display4$und$eq__AO__V(that.display4__AO());
      $$this.display3$und$eq__AO__V(that.display3__AO());
      $$this.display2$und$eq__AO__V(that.display2__AO());
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 5: {
      $$this.display5$und$eq__AO__V(that.display5__AO());
      $$this.display4$und$eq__AO__V(that.display4__AO());
      $$this.display3$und$eq__AO__V(that.display3__AO());
      $$this.display2$und$eq__AO__V(that.display2__AO());
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
var $s_sci_VectorPointer$class__gotoNextBlockStart__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor < 1024)) {
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
  } else if ((xor < 32768)) {
    $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[0], 1))
  } else if ((xor < 1048576)) {
    $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1));
    $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[0], 1))
  } else if ((xor < 33554432)) {
    $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[(31 & (index >> 20))], 1));
    $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[0], 1));
    $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[0], 1))
  } else if ((xor < 1073741824)) {
    $$this.display4$und$eq__AO__V($asArrayOf_O($$this.display5__AO().u[(31 & (index >> 25))], 1));
    $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[0], 1));
    $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[0], 1));
    $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[0], 1))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
});
var $s_sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 32768)) {
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1048576)) {
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 33554432)) {
      $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[(31 & (index >> 20))], 1));
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1073741824)) {
      $$this.display4$und$eq__AO__V($asArrayOf_O($$this.display5__AO().u[(31 & (index >> 25))], 1));
      $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[(31 & (index >> 20))], 1));
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
});
var $s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO = (function($$this, a) {
  if ((a === null)) {
    var this$2 = $m_s_Console$();
    var this$3 = this$2.outVar$2;
    $as_Ljava_io_PrintStream(this$3.tl$1.get__O()).println__O__V("NULL")
  };
  var b = $newArrayObject($d_O.getArrayOf(), [a.u["length"]]);
  var length = a.u["length"];
  $systemArraycopy(a, 0, b, 0, length);
  return b
});
/** @constructor */
var $c_sci_WrappedString$ = (function() {
  $c_O.call(this)
});
$c_sci_WrappedString$.prototype = new $h_O();
$c_sci_WrappedString$.prototype.constructor = $c_sci_WrappedString$;
/** @constructor */
var $h_sci_WrappedString$ = (function() {
  /*<skip>*/
});
$h_sci_WrappedString$.prototype = $c_sci_WrappedString$.prototype;
$c_sci_WrappedString$.prototype.newBuilder__scm_Builder = (function() {
  var this$3 = new $c_scm_StringBuilder().init___();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(x$2) {
      var x = $as_T(x$2);
      return new $c_sci_WrappedString().init___T(x)
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$3, f)
});
var $d_sci_WrappedString$ = new $TypeData().initClass({
  sci_WrappedString$: 0
}, false, "scala.collection.immutable.WrappedString$", {
  sci_WrappedString$: 1,
  O: 1
});
$c_sci_WrappedString$.prototype.$classData = $d_sci_WrappedString$;
var $n_sci_WrappedString$ = (void 0);
var $m_sci_WrappedString$ = (function() {
  if ((!$n_sci_WrappedString$)) {
    $n_sci_WrappedString$ = new $c_sci_WrappedString$().init___()
  };
  return $n_sci_WrappedString$
});
var $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V = (function($$this, coll) {
  if ($is_sc_IndexedSeqLike(coll)) {
    $$this.sizeHint__I__V(coll.size__I())
  }
});
var $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__I__V = (function($$this, coll, delta) {
  if ($is_sc_IndexedSeqLike(coll)) {
    $$this.sizeHint__I__V(((coll.size__I() + delta) | 0))
  }
});
var $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V = (function($$this, size, boundingColl) {
  if ($is_sc_IndexedSeqLike(boundingColl)) {
    var that = boundingColl.size__I();
    $$this.sizeHint__I__V(((size < that) ? size : that))
  }
});
/** @constructor */
var $c_scm_FlatHashTable$ = (function() {
  $c_O.call(this)
});
$c_scm_FlatHashTable$.prototype = new $h_O();
$c_scm_FlatHashTable$.prototype.constructor = $c_scm_FlatHashTable$;
/** @constructor */
var $h_scm_FlatHashTable$ = (function() {
  /*<skip>*/
});
$h_scm_FlatHashTable$.prototype = $c_scm_FlatHashTable$.prototype;
$c_scm_FlatHashTable$.prototype.newThreshold__I__I__I = (function(_loadFactor, size) {
  var assertion = (_loadFactor < 500);
  if ((!assertion)) {
    throw new $c_jl_AssertionError().init___O(("assertion failed: " + "loadFactor too large; must be < 0.5"))
  };
  return new $c_sjsr_RuntimeLong().init___I(size).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(_loadFactor)).$$div__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I__I(1000, 0, 0)).toInt__I()
});
var $d_scm_FlatHashTable$ = new $TypeData().initClass({
  scm_FlatHashTable$: 0
}, false, "scala.collection.mutable.FlatHashTable$", {
  scm_FlatHashTable$: 1,
  O: 1
});
$c_scm_FlatHashTable$.prototype.$classData = $d_scm_FlatHashTable$;
var $n_scm_FlatHashTable$ = (void 0);
var $m_scm_FlatHashTable$ = (function() {
  if ((!$n_scm_FlatHashTable$)) {
    $n_scm_FlatHashTable$ = new $c_scm_FlatHashTable$().init___()
  };
  return $n_scm_FlatHashTable$
});
var $s_scm_FlatHashTable$HashUtils$class__improve__scm_FlatHashTable$HashUtils__I__I__I = (function($$this, hcode, seed) {
  var improved = $m_s_util_hashing_package$().byteswap32__I__I(hcode);
  var rotation = (seed % 32);
  var rotated = (((improved >>> rotation) | 0) | (improved << ((32 - rotation) | 0)));
  return rotated
});
var $s_scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O = (function($$this, entry) {
  return ((entry === $m_scm_FlatHashTable$NullSentinel$()) ? null : entry)
});
var $s_scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O = (function($$this, elem) {
  return ((elem === null) ? $m_scm_FlatHashTable$NullSentinel$() : elem)
});
/** @constructor */
var $c_scm_FlatHashTable$NullSentinel$ = (function() {
  $c_O.call(this)
});
$c_scm_FlatHashTable$NullSentinel$.prototype = new $h_O();
$c_scm_FlatHashTable$NullSentinel$.prototype.constructor = $c_scm_FlatHashTable$NullSentinel$;
/** @constructor */
var $h_scm_FlatHashTable$NullSentinel$ = (function() {
  /*<skip>*/
});
$h_scm_FlatHashTable$NullSentinel$.prototype = $c_scm_FlatHashTable$NullSentinel$.prototype;
$c_scm_FlatHashTable$NullSentinel$.prototype.toString__T = (function() {
  return "NullSentinel"
});
$c_scm_FlatHashTable$NullSentinel$.prototype.hashCode__I = (function() {
  return 0
});
var $d_scm_FlatHashTable$NullSentinel$ = new $TypeData().initClass({
  scm_FlatHashTable$NullSentinel$: 0
}, false, "scala.collection.mutable.FlatHashTable$NullSentinel$", {
  scm_FlatHashTable$NullSentinel$: 1,
  O: 1
});
$c_scm_FlatHashTable$NullSentinel$.prototype.$classData = $d_scm_FlatHashTable$NullSentinel$;
var $n_scm_FlatHashTable$NullSentinel$ = (void 0);
var $m_scm_FlatHashTable$NullSentinel$ = (function() {
  if ((!$n_scm_FlatHashTable$NullSentinel$)) {
    $n_scm_FlatHashTable$NullSentinel$ = new $c_scm_FlatHashTable$NullSentinel$().init___()
  };
  return $n_scm_FlatHashTable$NullSentinel$
});
var $s_scm_FlatHashTable$class__growTable__p0__scm_FlatHashTable__V = (function($$this) {
  var oldtable = $$this.table$5;
  $$this.table$5 = $newArrayObject($d_O.getArrayOf(), [$imul(2, $$this.table$5.u["length"])]);
  $$this.tableSize$5 = 0;
  var tableLength = $$this.table$5.u["length"];
  $s_scm_FlatHashTable$class__nnSizeMapReset__scm_FlatHashTable__I__V($$this, tableLength);
  $$this.seedvalue$5 = $s_scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I($$this);
  $$this.threshold$5 = $m_scm_FlatHashTable$().newThreshold__I__I__I($$this.$$undloadFactor$5, $$this.table$5.u["length"]);
  var i = 0;
  while ((i < oldtable.u["length"])) {
    var entry = oldtable.u[i];
    if ((entry !== null)) {
      $s_scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z($$this, entry)
    };
    i = ((1 + i) | 0)
  }
});
var $s_scm_FlatHashTable$class__calcSizeMapSize__scm_FlatHashTable__I__I = (function($$this, tableLength) {
  return ((1 + (tableLength >> 5)) | 0)
});
var $s_scm_FlatHashTable$class__nnSizeMapAdd__scm_FlatHashTable__I__V = (function($$this, h) {
  if (($$this.sizemap$5 !== null)) {
    var p = (h >> 5);
    var ev$1 = $$this.sizemap$5;
    ev$1.u[p] = ((1 + ev$1.u[p]) | 0)
  }
});
var $s_scm_FlatHashTable$class__$$init$__scm_FlatHashTable__V = (function($$this) {
  $$this.$$undloadFactor$5 = 450;
  $$this.table$5 = $newArrayObject($d_O.getArrayOf(), [$s_scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I($$this, 32)]);
  $$this.tableSize$5 = 0;
  $$this.threshold$5 = $m_scm_FlatHashTable$().newThreshold__I__I__I($$this.$$undloadFactor$5, $s_scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I($$this, 32));
  $$this.sizemap$5 = null;
  $$this.seedvalue$5 = $s_scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I($$this)
});
var $s_scm_FlatHashTable$class__findElemImpl__p0__scm_FlatHashTable__O__O = (function($$this, elem) {
  var searchEntry = $s_scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O($$this, elem);
  var hcode = $objectHashCode(searchEntry);
  var h = $s_scm_FlatHashTable$class__index__scm_FlatHashTable__I__I($$this, hcode);
  var curEntry = $$this.table$5.u[h];
  while (((curEntry !== null) && (!$m_sr_BoxesRunTime$().equals__O__O__Z(curEntry, searchEntry)))) {
    h = (((1 + h) | 0) % $$this.table$5.u["length"]);
    curEntry = $$this.table$5.u[h]
  };
  return curEntry
});
var $s_scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z = (function($$this, newEntry) {
  var hcode = $objectHashCode(newEntry);
  var h = $s_scm_FlatHashTable$class__index__scm_FlatHashTable__I__I($$this, hcode);
  var curEntry = $$this.table$5.u[h];
  while ((curEntry !== null)) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(curEntry, newEntry)) {
      return false
    };
    h = (((1 + h) | 0) % $$this.table$5.u["length"]);
    curEntry = $$this.table$5.u[h]
  };
  $$this.table$5.u[h] = newEntry;
  $$this.tableSize$5 = ((1 + $$this.tableSize$5) | 0);
  var h$1 = h;
  $s_scm_FlatHashTable$class__nnSizeMapAdd__scm_FlatHashTable__I__V($$this, h$1);
  if (($$this.tableSize$5 >= $$this.threshold$5)) {
    $s_scm_FlatHashTable$class__growTable__p0__scm_FlatHashTable__V($$this)
  };
  return true
});
var $s_scm_FlatHashTable$class__addElem__scm_FlatHashTable__O__Z = (function($$this, elem) {
  var newEntry = $s_scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O($$this, elem);
  return $s_scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z($$this, newEntry)
});
var $s_scm_FlatHashTable$class__index__scm_FlatHashTable__I__I = (function($$this, hcode) {
  var seed = $$this.seedvalue$5;
  var improved = $s_scm_FlatHashTable$HashUtils$class__improve__scm_FlatHashTable$HashUtils__I__I__I($$this, hcode, seed);
  var ones = (((-1) + $$this.table$5.u["length"]) | 0);
  return (((improved >>> ((32 - $m_jl_Integer$().bitCount__I__I(ones)) | 0)) | 0) & ones)
});
var $s_scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I = (function($$this, expectedSize) {
  return ((expectedSize === 0) ? 1 : $m_scm_HashTable$().powerOfTwo__I__I(expectedSize))
});
var $s_scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I = (function($$this) {
  return $m_jl_Integer$().bitCount__I__I((((-1) + $$this.table$5.u["length"]) | 0))
});
var $s_scm_FlatHashTable$class__nnSizeMapReset__scm_FlatHashTable__I__V = (function($$this, tableLength) {
  if (($$this.sizemap$5 !== null)) {
    var nsize = $s_scm_FlatHashTable$class__calcSizeMapSize__scm_FlatHashTable__I__I($$this, tableLength);
    if (($$this.sizemap$5.u["length"] !== nsize)) {
      $$this.sizemap$5 = $newArrayObject($d_I.getArrayOf(), [nsize])
    } else {
      var this$1 = $m_ju_Arrays$();
      var a = $$this.sizemap$5;
      this$1.fillImpl$mIc$sp__p1__AI__I__V(a, 0)
    }
  }
});
var $s_scm_FlatHashTable$class__initWithContents__scm_FlatHashTable__scm_FlatHashTable$Contents__V = (function($$this, c) {
  if ((c !== null)) {
    $$this.$$undloadFactor$5 = c.loadFactor__I();
    $$this.table$5 = c.table__AO();
    $$this.tableSize$5 = c.tableSize__I();
    $$this.threshold$5 = c.threshold__I();
    $$this.seedvalue$5 = c.seedvalue__I();
    $$this.sizemap$5 = c.sizemap__AI()
  }
});
var $s_scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z = (function($$this, elem) {
  return ($s_scm_FlatHashTable$class__findElemImpl__p0__scm_FlatHashTable__O__O($$this, elem) !== null)
});
/** @constructor */
var $c_scm_HashTable$ = (function() {
  $c_O.call(this)
});
$c_scm_HashTable$.prototype = new $h_O();
$c_scm_HashTable$.prototype.constructor = $c_scm_HashTable$;
/** @constructor */
var $h_scm_HashTable$ = (function() {
  /*<skip>*/
});
$h_scm_HashTable$.prototype = $c_scm_HashTable$.prototype;
$c_scm_HashTable$.prototype.powerOfTwo__I__I = (function(target) {
  var c = (((-1) + target) | 0);
  c = (c | ((c >>> 1) | 0));
  c = (c | ((c >>> 2) | 0));
  c = (c | ((c >>> 4) | 0));
  c = (c | ((c >>> 8) | 0));
  c = (c | ((c >>> 16) | 0));
  return ((1 + c) | 0)
});
var $d_scm_HashTable$ = new $TypeData().initClass({
  scm_HashTable$: 0
}, false, "scala.collection.mutable.HashTable$", {
  scm_HashTable$: 1,
  O: 1
});
$c_scm_HashTable$.prototype.$classData = $d_scm_HashTable$;
var $n_scm_HashTable$ = (void 0);
var $m_scm_HashTable$ = (function() {
  if ((!$n_scm_HashTable$)) {
    $n_scm_HashTable$ = new $c_scm_HashTable$().init___()
  };
  return $n_scm_HashTable$
});
var $s_scm_ResizableArray$class__copyToArray__scm_ResizableArray__O__I__I__V = (function($$this, xs, start, len) {
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var $$this$1 = ((len < that) ? len : that);
  var that$1 = $$this.size0$6;
  var len1 = (($$this$1 < that$1) ? $$this$1 : that$1);
  $m_s_Array$().copy__O__I__O__I__I__V($$this.array$6, 0, xs, start, len1)
});
var $s_scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V = (function($$this, n) {
  var x = $$this.array$6.u["length"];
  var arrayLength = new $c_sjsr_RuntimeLong().init___I(x);
  if (new $c_sjsr_RuntimeLong().init___I(n).$$greater__sjsr_RuntimeLong__Z(arrayLength)) {
    var newSize = new $c_sjsr_RuntimeLong().init___I__I__I(2, 0, 0).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(arrayLength);
    while (new $c_sjsr_RuntimeLong().init___I(n).$$greater__sjsr_RuntimeLong__Z(newSize)) {
      newSize = new $c_sjsr_RuntimeLong().init___I__I__I(2, 0, 0).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(newSize)
    };
    if (newSize.$$greater__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I__I__I(4194303, 511, 0))) {
      newSize = new $c_sjsr_RuntimeLong().init___I__I__I(4194303, 511, 0)
    };
    var newArray = $newArrayObject($d_O.getArrayOf(), [newSize.toInt__I()]);
    var src = $$this.array$6;
    var length = $$this.size0$6;
    $systemArraycopy(src, 0, newArray, 0, length);
    $$this.array$6 = newArray
  }
});
var $s_scm_ResizableArray$class__foreach__scm_ResizableArray__F1__V = (function($$this, f) {
  var i = 0;
  var top = $$this.size0$6;
  while ((i < top)) {
    f.apply__O__O($$this.array$6.u[i]);
    i = ((1 + i) | 0)
  }
});
var $s_scm_ResizableArray$class__apply__scm_ResizableArray__I__O = (function($$this, idx) {
  if ((idx >= $$this.size0$6)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $$this.array$6.u[idx]
});
var $s_scm_ResizableArray$class__$$init$__scm_ResizableArray__V = (function($$this) {
  var x = $$this.initialSize$6;
  $$this.array$6 = $newArrayObject($d_O.getArrayOf(), [((x > 1) ? x : 1)]);
  $$this.size0$6 = 0
});
/** @constructor */
var $c_sjs_concurrent_JSExecutionContext$ = (function() {
  $c_O.call(this);
  this.runNow$1 = null;
  this.queue$1 = null
});
$c_sjs_concurrent_JSExecutionContext$.prototype = new $h_O();
$c_sjs_concurrent_JSExecutionContext$.prototype.constructor = $c_sjs_concurrent_JSExecutionContext$;
/** @constructor */
var $h_sjs_concurrent_JSExecutionContext$ = (function() {
  /*<skip>*/
});
$h_sjs_concurrent_JSExecutionContext$.prototype = $c_sjs_concurrent_JSExecutionContext$.prototype;
$c_sjs_concurrent_JSExecutionContext$.prototype.init___ = (function() {
  $n_sjs_concurrent_JSExecutionContext$ = this;
  this.runNow$1 = $m_sjs_concurrent_RunNowExecutionContext$();
  this.queue$1 = $m_sjs_concurrent_QueueExecutionContext$();
  return this
});
var $d_sjs_concurrent_JSExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_JSExecutionContext$: 0
}, false, "scala.scalajs.concurrent.JSExecutionContext$", {
  sjs_concurrent_JSExecutionContext$: 1,
  O: 1
});
$c_sjs_concurrent_JSExecutionContext$.prototype.$classData = $d_sjs_concurrent_JSExecutionContext$;
var $n_sjs_concurrent_JSExecutionContext$ = (void 0);
var $m_sjs_concurrent_JSExecutionContext$ = (function() {
  if ((!$n_sjs_concurrent_JSExecutionContext$)) {
    $n_sjs_concurrent_JSExecutionContext$ = new $c_sjs_concurrent_JSExecutionContext$().init___()
  };
  return $n_sjs_concurrent_JSExecutionContext$
});
/** @constructor */
var $c_sjs_js_WrappedDictionary$Cache$ = (function() {
  $c_O.call(this);
  this.safeHasOwnProperty$1 = null
});
$c_sjs_js_WrappedDictionary$Cache$.prototype = new $h_O();
$c_sjs_js_WrappedDictionary$Cache$.prototype.constructor = $c_sjs_js_WrappedDictionary$Cache$;
/** @constructor */
var $h_sjs_js_WrappedDictionary$Cache$ = (function() {
  /*<skip>*/
});
$h_sjs_js_WrappedDictionary$Cache$.prototype = $c_sjs_js_WrappedDictionary$Cache$.prototype;
$c_sjs_js_WrappedDictionary$Cache$.prototype.init___ = (function() {
  $n_sjs_js_WrappedDictionary$Cache$ = this;
  this.safeHasOwnProperty$1 = $g["Object"]["prototype"]["hasOwnProperty"];
  return this
});
var $d_sjs_js_WrappedDictionary$Cache$ = new $TypeData().initClass({
  sjs_js_WrappedDictionary$Cache$: 0
}, false, "scala.scalajs.js.WrappedDictionary$Cache$", {
  sjs_js_WrappedDictionary$Cache$: 1,
  O: 1
});
$c_sjs_js_WrappedDictionary$Cache$.prototype.$classData = $d_sjs_js_WrappedDictionary$Cache$;
var $n_sjs_js_WrappedDictionary$Cache$ = (void 0);
var $m_sjs_js_WrappedDictionary$Cache$ = (function() {
  if ((!$n_sjs_js_WrappedDictionary$Cache$)) {
    $n_sjs_js_WrappedDictionary$Cache$ = new $c_sjs_js_WrappedDictionary$Cache$().init___()
  };
  return $n_sjs_js_WrappedDictionary$Cache$
});
/** @constructor */
var $c_sjs_js_timers_package$ = (function() {
  $c_O.call(this)
});
$c_sjs_js_timers_package$.prototype = new $h_O();
$c_sjs_js_timers_package$.prototype.constructor = $c_sjs_js_timers_package$;
/** @constructor */
var $h_sjs_js_timers_package$ = (function() {
  /*<skip>*/
});
$h_sjs_js_timers_package$.prototype = $c_sjs_js_timers_package$.prototype;
$c_sjs_js_timers_package$.prototype.clearInterval__sjs_js_timers_SetIntervalHandle__V = (function(handle) {
  $g["clearInterval"](handle)
});
$c_sjs_js_timers_package$.prototype.setTimeout__D__F0__sjs_js_timers_SetTimeoutHandle = (function(interval, body) {
  return $g["setTimeout"]((function(f) {
    return (function() {
      return f.apply__O()
    })
  })(body), interval)
});
$c_sjs_js_timers_package$.prototype.setInterval__D__F0__sjs_js_timers_SetIntervalHandle = (function(interval, body) {
  return $g["setInterval"]((function(f) {
    return (function() {
      return f.apply__O()
    })
  })(body), interval)
});
var $d_sjs_js_timers_package$ = new $TypeData().initClass({
  sjs_js_timers_package$: 0
}, false, "scala.scalajs.js.timers.package$", {
  sjs_js_timers_package$: 1,
  O: 1
});
$c_sjs_js_timers_package$.prototype.$classData = $d_sjs_js_timers_package$;
var $n_sjs_js_timers_package$ = (void 0);
var $m_sjs_js_timers_package$ = (function() {
  if ((!$n_sjs_js_timers_package$)) {
    $n_sjs_js_timers_package$ = new $c_sjs_js_timers_package$().init___()
  };
  return $n_sjs_js_timers_package$
});
/** @constructor */
var $c_sjsr_Bits$ = (function() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
});
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
var $h_sjsr_Bits$ = (function() {
  /*<skip>*/
});
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g["ArrayBuffer"] && $g["Int32Array"]) && $g["Float32Array"]) && $g["Float64Array"]);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g["ArrayBuffer"](8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g["Int32Array"](this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g["Float32Array"](this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g["Float64Array"](this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g["Int8Array"](this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = (value | 0);
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var this$1 = this.doubleToLongBits__D__J(value);
    return this$1.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(this$1.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I()
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g["Math"]["pow"](2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g["Math"]["pow"](2.0, (-1022))))) {
      var twoPowFbits = $uD($g["Math"]["pow"](2.0, 52));
      var a = ($uD($g["Math"]["log"](av)) / 0.6931471805599453);
      var a$1 = ($uD($g["Math"]["floor"](a)) | 0);
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / $uD($g["Math"]["pow"](2.0, b))) * twoPowFbits);
      var w = $uD($g["Math"]["floor"](n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g["Math"]["pow"](2.0, (-1074))));
      var w$1 = $uD($g["Math"]["floor"](n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$2_$_$$und1$1 = s$1;
  var x$2_$_$$und2$1 = e$1;
  var x$2_$_$$und3$1 = f$3;
  var s$2 = $uZ(x$2_$_$$und1$1);
  var e$2 = $uI(x$2_$_$$und2$1);
  var f$2$1 = $uD(x$2_$_$$und3$1);
  var hif = ((f$2$1 / 4.294967296E9) | 0);
  var hi = (((s$2 ? (-2147483648) : 0) | (e$2 << 20)) | hif);
  var lo = (f$2$1 | 0);
  return new $c_sjsr_RuntimeLong().init___I(hi).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I__I(4194303, 1023, 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(lo)))
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    return new $c_sjsr_RuntimeLong().init___I($uI(this.int32Array$1[this.highOffset$1])).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I__I(4194303, 1023, 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I($uI(this.int32Array$1[this.lowOffset$1]))))
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
var $m_sjsr_Bits$ = (function() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
});
/** @constructor */
var $c_sjsr_RuntimeString$ = (function() {
  $c_O.call(this)
});
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
var $h_sjsr_RuntimeString$ = (function() {
  /*<skip>*/
});
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I__I = (function(thiz, ch, fromIndex) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz["indexOf"](str, fromIndex))
});
$c_sjsr_RuntimeString$.prototype.valueOf__O__T = (function(value) {
  return ((value === null) ? "null" : $objectToString(value))
});
$c_sjsr_RuntimeString$.prototype.lastIndexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz["lastIndexOf"](str))
});
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz["indexOf"](str))
});
$c_sjsr_RuntimeString$.prototype.fromCodePoint__p1__I__T = (function(codePoint) {
  if ((((-65536) & codePoint) === 0)) {
    var array = [codePoint];
    var jsx$2 = $g["String"];
    var jsx$4 = jsx$2["fromCharCode"];
    matchEnd5: {
      var jsx$3;
      var jsx$3 = array;
      break matchEnd5
    };
    var jsx$1 = jsx$4["apply"](jsx$2, jsx$3);
    return $as_T(jsx$1)
  } else if (((codePoint < 0) || (codePoint > 1114111))) {
    throw new $c_jl_IllegalArgumentException().init___()
  } else {
    var offsetCp = (((-65536) + codePoint) | 0);
    var array$1 = [(55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp))];
    var jsx$6 = $g["String"];
    var jsx$8 = jsx$6["fromCharCode"];
    matchEnd5$1: {
      var jsx$7;
      var jsx$7 = array$1;
      break matchEnd5$1
    };
    var jsx$5 = jsx$8["apply"](jsx$6, jsx$7);
    return $as_T(jsx$5)
  }
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz["length"])) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz["charCodeAt"](index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
var $m_sjsr_RuntimeString$ = (function() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
});
/** @constructor */
var $c_sjsr_StackTrace$ = (function() {
  $c_O.call(this);
  this.isRhino$1 = false;
  this.decompressedClasses$1 = null;
  this.decompressedPrefixes$1 = null;
  this.compressedPrefixes$1 = null;
  this.bitmap$0$1 = false
});
$c_sjsr_StackTrace$.prototype = new $h_O();
$c_sjsr_StackTrace$.prototype.constructor = $c_sjsr_StackTrace$;
/** @constructor */
var $h_sjsr_StackTrace$ = (function() {
  /*<skip>*/
});
$h_sjsr_StackTrace$.prototype = $c_sjsr_StackTrace$.prototype;
$c_sjsr_StackTrace$.prototype.extractFirefox__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = $as_T(e["stack"]);
  var jsx$2 = x["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("(?:\\n@:0)?\\s+$", "m"), "");
  var x$1 = $as_T(jsx$2);
  var jsx$1 = x$1["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(?:\\((\\S*)\\))?@", "gm"), "{anonymous}($1)@");
  var x$2 = $as_T(jsx$1);
  return x$2["split"]("\n")
});
$c_sjsr_StackTrace$.prototype.extractOpera10a__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var lineRE = $m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("Line (\\d+).*script (?:in )?(\\S+)(?:: In function (\\S+))?$", "i");
  var x = $as_T(e["stacktrace"]);
  var lines = x["split"]("\n");
  var result = [];
  var i = 0;
  var len = $uI(lines["length"]);
  while ((i < len)) {
    var mtch = lineRE["exec"]($as_T(lines[i]));
    if ((mtch !== null)) {
      var $$this = mtch[3];
      var fnName = $as_T((($$this === (void 0)) ? "{anonymous}" : $$this));
      var $$this$1 = mtch[2];
      if (($$this$1 === (void 0))) {
        var jsx$3;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$3 = $$this$1
      };
      var $$this$2 = mtch[1];
      if (($$this$2 === (void 0))) {
        var jsx$2;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$2 = $$this$2
      };
      var jsx$1 = result["push"](((((fnName + "()@") + jsx$3) + ":") + jsx$2));
      $uI(jsx$1)
    };
    i = ((2 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.init___ = (function() {
  $n_sjsr_StackTrace$ = this;
  var dict = {
    "O": "java_lang_Object",
    "T": "java_lang_String",
    "V": "scala_Unit",
    "Z": "scala_Boolean",
    "C": "scala_Char",
    "B": "scala_Byte",
    "S": "scala_Short",
    "I": "scala_Int",
    "J": "scala_Long",
    "F": "scala_Float",
    "D": "scala_Double"
  };
  var index = 0;
  while ((index <= 22)) {
    if ((index >= 2)) {
      dict[("T" + index)] = ("scala_Tuple" + index)
    };
    dict[("F" + index)] = ("scala_Function" + index);
    index = ((1 + index) | 0)
  };
  this.decompressedClasses$1 = dict;
  this.decompressedPrefixes$1 = {
    "sjsr_": "scala_scalajs_runtime_",
    "sjs_": "scala_scalajs_",
    "sci_": "scala_collection_immutable_",
    "scm_": "scala_collection_mutable_",
    "scg_": "scala_collection_generic_",
    "sc_": "scala_collection_",
    "sr_": "scala_runtime_",
    "s_": "scala_",
    "jl_": "java_lang_",
    "ju_": "java_util_"
  };
  this.compressedPrefixes$1 = $g["Object"]["keys"](this.decompressedPrefixes$1);
  return this
});
$c_sjsr_StackTrace$.prototype.isRhino__p1__Z = (function() {
  return ((!this.bitmap$0$1) ? this.isRhino$lzycompute__p1__Z() : this.isRhino$1)
});
$c_sjsr_StackTrace$.prototype.decodeClassName__p1__T__T = (function(encodedName) {
  var encoded = (((65535 & $uI(encodedName["charCodeAt"](0))) === 36) ? $as_T(encodedName["substring"](1)) : encodedName);
  var dict = this.decompressedClasses$1;
  if ($uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](dict, encoded))) {
    var dict$1 = this.decompressedClasses$1;
    if ($uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](dict$1, encoded))) {
      var jsx$1 = dict$1[encoded]
    } else {
      var jsx$1;
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + encoded))
    };
    var base = $as_T(jsx$1)
  } else {
    var base = this.loop$1__p1__I__T__T(0, encoded)
  };
  var thiz = $as_T(base["split"]("_")["join"]("."));
  return $as_T(thiz["split"]("$und")["join"]("_"))
});
$c_sjsr_StackTrace$.prototype.extractOpera10b__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var lineRE = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(.*)@(.+):(\\d+)$");
  var x = $as_T(e["stacktrace"]);
  var lines = x["split"]("\n");
  var result = [];
  var i = 0;
  var len = $uI(lines["length"]);
  while ((i < len)) {
    var mtch = lineRE["exec"]($as_T(lines[i]));
    if ((mtch !== null)) {
      var $$this = mtch[1];
      if (($$this === (void 0))) {
        var fnName = "global code"
      } else {
        var x$3 = $as_T($$this);
        var fnName = (x$3 + "()")
      };
      var $$this$1 = mtch[2];
      if (($$this$1 === (void 0))) {
        var jsx$3;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$3 = $$this$1
      };
      var $$this$2 = mtch[3];
      if (($$this$2 === (void 0))) {
        var jsx$2;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$2 = $$this$2
      };
      var jsx$1 = result["push"](((((fnName + "@") + jsx$3) + ":") + jsx$2));
      $uI(jsx$1)
    };
    i = ((1 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.extract__sjs_js_Dynamic__Ajl_StackTraceElement = (function(stackdata) {
  var lines = this.normalizeStackTraceLines__p1__sjs_js_Dynamic__sjs_js_Array(stackdata);
  return this.normalizedLinesToStackTrace__p1__sjs_js_Array__Ajl_StackTraceElement(lines)
});
$c_sjsr_StackTrace$.prototype.extractChrome__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = ($as_T(e["stack"]) + "\n");
  var jsx$6 = x["replace"]($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^[\\s\\S]+?\\s+at\\s+"), " at ");
  var x$1 = $as_T(jsx$6);
  var jsx$5 = x$1["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s+(at eval )?at\\s+", "gm"), "");
  var x$2 = $as_T(jsx$5);
  var jsx$4 = x$2["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+?)([\\n])", "gm"), "{anonymous}() ($1)$2");
  var x$3 = $as_T(jsx$4);
  var jsx$3 = x$3["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^Object.<anonymous>\\s*\\(([^\\)]+)\\)", "gm"), "{anonymous}() ($1)");
  var x$4 = $as_T(jsx$3);
  var jsx$2 = x$4["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+|\\{anonymous\\}\\(\\)) \\((.+)\\)$", "gm"), "$1@$2");
  var x$5 = $as_T(jsx$2);
  var jsx$1 = x$5["split"]("\n");
  return jsx$1["slice"](0, (-1))
});
$c_sjsr_StackTrace$.prototype.createException__p1__O = (function() {
  try {
    return this["undef"]()
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      if ($is_sjs_js_JavaScriptException(e$2)) {
        var x5 = $as_sjs_js_JavaScriptException(e$2);
        var e$3 = x5.exception$4;
        return e$3
      } else {
        throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
$c_sjsr_StackTrace$.prototype.extractClassMethod__p1__T__T2 = (function(functionName) {
  var PatC = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.c\\.|\\$c_)([^\\.]+)(?:\\.prototype)?\\.([^\\.]+)$");
  var PatS = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.s\\.|\\$s_)((?:_[^_]|[^_])+)__([^\\.]+)$");
  var PatM = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.m\\.|\\$m_)([^\\.]+)$");
  var isModule = false;
  var mtch = PatC["exec"](functionName);
  if ((mtch === null)) {
    mtch = PatS["exec"](functionName);
    if ((mtch === null)) {
      mtch = PatM["exec"](functionName);
      isModule = true
    }
  };
  if ((mtch !== null)) {
    var $$this = mtch[1];
    if (($$this === (void 0))) {
      var jsx$1;
      throw new $c_ju_NoSuchElementException().init___T("undefined.get")
    } else {
      var jsx$1 = $$this
    };
    var className = this.decodeClassName__p1__T__T($as_T(jsx$1));
    if (isModule) {
      var methodName = "<clinit>"
    } else {
      var $$this$1 = mtch[2];
      if (($$this$1 === (void 0))) {
        var jsx$2;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$2 = $$this$1
      };
      var methodName = this.decodeMethodName__p1__T__T($as_T(jsx$2))
    };
    return new $c_T2().init___O__O(className, methodName)
  } else {
    return new $c_T2().init___O__O("<jscode>", functionName)
  }
});
$c_sjsr_StackTrace$.prototype.isRhino$lzycompute__p1__Z = (function() {
  if ((!this.bitmap$0$1)) {
    this.isRhino$1 = this.liftedTree1$1__p1__Z();
    this.bitmap$0$1 = true
  };
  return this.isRhino$1
});
$c_sjsr_StackTrace$.prototype.extract__jl_Throwable__Ajl_StackTraceElement = (function(throwable) {
  return this.extract__sjs_js_Dynamic__Ajl_StackTraceElement(throwable["stackdata"])
});
$c_sjsr_StackTrace$.prototype.captureState__jl_Throwable__O__V = (function(throwable, e) {
  throwable["stackdata"] = e
});
$c_sjsr_StackTrace$.prototype.normalizeStackTraceLines__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = (!e);
  if ($uZ((!(!x)))) {
    return []
  } else if (this.isRhino__p1__Z()) {
    return this.extractRhino__p1__sjs_js_Dynamic__sjs_js_Array(e)
  } else {
    var x$1 = (e["arguments"] && e["stack"]);
    if ($uZ((!(!x$1)))) {
      return this.extractChrome__p1__sjs_js_Dynamic__sjs_js_Array(e)
    } else {
      var x$2 = (e["stack"] && e["sourceURL"]);
      if ($uZ((!(!x$2)))) {
        return this.extractSafari__p1__sjs_js_Dynamic__sjs_js_Array(e)
      } else {
        var x$3 = (e["stack"] && e["number"]);
        if ($uZ((!(!x$3)))) {
          return this.extractIE__p1__sjs_js_Dynamic__sjs_js_Array(e)
        } else {
          var x$4 = (e["stack"] && e["fileName"]);
          if ($uZ((!(!x$4)))) {
            return this.extractFirefox__p1__sjs_js_Dynamic__sjs_js_Array(e)
          } else {
            var x$5 = (e["message"] && e["opera#sourceloc"]);
            if ($uZ((!(!x$5)))) {
              var x$6 = (!e["stacktrace"]);
              if ($uZ((!(!x$6)))) {
                return this.extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array(e)
              } else {
                var x$7 = ((e["message"]["indexOf"]("\n") > (-1)) && (e["message"]["split"]("\n")["length"] > e["stacktrace"]["split"]("\n")["length"]));
                if ($uZ((!(!x$7)))) {
                  return this.extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array(e)
                } else {
                  return this.extractOpera10a__p1__sjs_js_Dynamic__sjs_js_Array(e)
                }
              }
            } else {
              var x$8 = ((e["message"] && e["stack"]) && e["stacktrace"]);
              if ($uZ((!(!x$8)))) {
                var x$9 = (e["stacktrace"]["indexOf"]("called from line") < 0);
                if ($uZ((!(!x$9)))) {
                  return this.extractOpera10b__p1__sjs_js_Dynamic__sjs_js_Array(e)
                } else {
                  return this.extractOpera11__p1__sjs_js_Dynamic__sjs_js_Array(e)
                }
              } else {
                var x$10 = (e["stack"] && (!e["fileName"]));
                if ($uZ((!(!x$10)))) {
                  return this.extractChrome__p1__sjs_js_Dynamic__sjs_js_Array(e)
                } else {
                  return this.extractOther__p1__sjs_js_Dynamic__sjs_js_Array(e)
                }
              }
            }
          }
        }
      }
    }
  }
});
$c_sjsr_StackTrace$.prototype.normalizedLinesToStackTrace__p1__sjs_js_Array__Ajl_StackTraceElement = (function(lines) {
  var NormalizedFrameLine = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^([^\\@]*)\\@(.*):([0-9]+)$");
  var NormalizedFrameLineWithColumn = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^([^\\@]*)\\@(.*):([0-9]+):([0-9]+)$");
  var trace = [];
  var i = 0;
  while ((i < $uI(lines["length"]))) {
    var line = $as_T(lines[i]);
    if ((line === null)) {
      var jsx$1;
      throw new $c_jl_NullPointerException().init___()
    } else {
      var jsx$1 = line
    };
    if ((jsx$1 !== "")) {
      var mtch1 = NormalizedFrameLineWithColumn["exec"](line);
      if ((mtch1 !== null)) {
        var $$this = mtch1[1];
        if (($$this === (void 0))) {
          var jsx$2;
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        } else {
          var jsx$2 = $$this
        };
        var x1 = this.extractClassMethod__p1__T__T2($as_T(jsx$2));
        if ((x1 !== null)) {
          var className = $as_T(x1.$$und1$f);
          var methodName = $as_T(x1.$$und2$f);
          var x$1_$_$$und1$f = className;
          var x$1_$_$$und2$f = methodName
        } else {
          var x$1_$_$$und1$f;
          var x$1_$_$$und2$f;
          throw new $c_s_MatchError().init___O(x1)
        };
        var className$2 = $as_T(x$1_$_$$und1$f);
        var methodName$2 = $as_T(x$1_$_$$und2$f);
        var $$this$1 = mtch1[2];
        if (($$this$1 === (void 0))) {
          var jsx$4;
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        } else {
          var jsx$4 = $$this$1
        };
        var fileName = $as_T(jsx$4);
        var $$this$2 = mtch1[3];
        if (($$this$2 === (void 0))) {
          var jsx$5;
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        } else {
          var jsx$5 = $$this$2
        };
        var this$12 = new $c_sci_StringOps().init___T($as_T(jsx$5));
        var this$14 = $m_jl_Integer$();
        var s = this$12.repr$1;
        var lineNumber = this$14.parseInt__T__I__I(s, 10);
        var $$this$4 = mtch1[4];
        if (($$this$4 === (void 0))) {
          var jsx$6;
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        } else {
          var jsx$6 = $$this$4
        };
        var this$19 = new $c_sci_StringOps().init___T($as_T(jsx$6));
        var this$21 = $m_jl_Integer$();
        var s$1 = this$19.repr$1;
        var columnNumber = this$21.parseInt__T__I__I(s$1, 10);
        var jsx$3 = trace["push"]({
          "declaringClass": className$2,
          "methodName": methodName$2,
          "fileName": fileName,
          "lineNumber": lineNumber,
          "columnNumber": ((columnNumber === (void 0)) ? (void 0) : columnNumber)
        });
        $uI(jsx$3)
      } else {
        var mtch2 = NormalizedFrameLine["exec"](line);
        if ((mtch2 !== null)) {
          var $$this$6 = mtch2[1];
          if (($$this$6 === (void 0))) {
            var jsx$7;
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          } else {
            var jsx$7 = $$this$6
          };
          var x1$2 = this.extractClassMethod__p1__T__T2($as_T(jsx$7));
          if ((x1$2 !== null)) {
            var className$3 = $as_T(x1$2.$$und1$f);
            var methodName$3 = $as_T(x1$2.$$und2$f);
            var x$2$1_$_$$und1$f = className$3;
            var x$2$1_$_$$und2$f = methodName$3
          } else {
            var x$2$1_$_$$und1$f;
            var x$2$1_$_$$und2$f;
            throw new $c_s_MatchError().init___O(x1$2)
          };
          var className$4 = $as_T(x$2$1_$_$$und1$f);
          var methodName$4 = $as_T(x$2$1_$_$$und2$f);
          var $$this$7 = mtch2[2];
          if (($$this$7 === (void 0))) {
            var jsx$9;
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          } else {
            var jsx$9 = $$this$7
          };
          var fileName$1 = $as_T(jsx$9);
          var $$this$8 = mtch2[3];
          if (($$this$8 === (void 0))) {
            var jsx$10;
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          } else {
            var jsx$10 = $$this$8
          };
          var this$43 = new $c_sci_StringOps().init___T($as_T(jsx$10));
          var this$45 = $m_jl_Integer$();
          var s$2 = this$43.repr$1;
          var lineNumber$1 = this$45.parseInt__T__I__I(s$2, 10);
          var jsx$8 = trace["push"]({
            "declaringClass": className$4,
            "methodName": methodName$4,
            "fileName": fileName$1,
            "lineNumber": lineNumber$1,
            "columnNumber": (void 0)
          });
          $uI(jsx$8)
        } else {
          $uI(trace["push"]({
            "declaringClass": "<jscode>",
            "methodName": line,
            "fileName": null,
            "lineNumber": (-1),
            "columnNumber": (void 0)
          }))
        }
      }
    };
    i = ((1 + i) | 0)
  };
  var $$this$10 = $env["sourceMapper"];
  var mappedTrace = (($$this$10 === (void 0)) ? trace : $$this$10(trace));
  var result = $newArrayObject($d_jl_StackTraceElement.getArrayOf(), [$uI(mappedTrace["length"])]);
  i = 0;
  while ((i < $uI(mappedTrace["length"]))) {
    var jsSte = mappedTrace[i];
    var ste = new $c_jl_StackTraceElement().init___T__T__T__I($as_T(jsSte["declaringClass"]), $as_T(jsSte["methodName"]), $as_T(jsSte["fileName"]), $uI(jsSte["lineNumber"]));
    var $$this$11 = jsSte["columnNumber"];
    if (($$this$11 !== (void 0))) {
      var columnNumber$1 = $uI($$this$11);
      ste["setColumnNumber"](columnNumber$1)
    };
    result.u[i] = ste;
    i = ((1 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var lineRE = $m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("Line (\\d+).*script (?:in )?(\\S+)", "i");
  var x = $as_T(e["message"]);
  var lines = x["split"]("\n");
  var result = [];
  var i = 2;
  var len = $uI(lines["length"]);
  while ((i < len)) {
    var mtch = lineRE["exec"]($as_T(lines[i]));
    if ((mtch !== null)) {
      var $$this = mtch[2];
      if (($$this === (void 0))) {
        var jsx$3;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$3 = $$this
      };
      var $$this$1 = mtch[1];
      if (($$this$1 === (void 0))) {
        var jsx$2;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$2 = $$this$1
      };
      var jsx$1 = result["push"](((("{anonymous}()@" + jsx$3) + ":") + jsx$2));
      $uI(jsx$1)
    };
    i = ((2 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.extractOpera11__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var lineRE = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^.*line (\\d+), column (\\d+)(?: in (.+))? in (\\S+):$");
  var x = $as_T(e["stacktrace"]);
  var lines = x["split"]("\n");
  var result = [];
  var i = 0;
  var len = $uI(lines["length"]);
  while ((i < len)) {
    var mtch = lineRE["exec"]($as_T(lines[i]));
    if ((mtch !== null)) {
      var $$this = mtch[4];
      if (($$this === (void 0))) {
        var jsx$4;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$4 = $$this
      };
      var jsx$3 = $as_T(jsx$4);
      var $$this$1 = mtch[1];
      if (($$this$1 === (void 0))) {
        var jsx$2;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$2 = $$this$1
      };
      var $$this$2 = mtch[2];
      if (($$this$2 === (void 0))) {
        var jsx$1;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$1 = $$this$2
      };
      var location = ((((jsx$3 + ":") + jsx$2) + ":") + jsx$1);
      var $$this$3 = mtch[2];
      var fnName0 = $as_T((($$this$3 === (void 0)) ? "global code" : $$this$3));
      var x$1 = $as_T(fnName0["replace"]($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("<anonymous function: (\\S+)>"), "$1"));
      var jsx$5 = x$1["replace"]($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("<anonymous function>"), "{anonymous}");
      var fnName = $as_T(jsx$5);
      $uI(result["push"](((fnName + "@") + location)))
    };
    i = ((2 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.extractSafari__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = $as_T(e["stack"]);
  var jsx$3 = x["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("\\[native code\\]\\n", "m"), "");
  var x$1 = $as_T(jsx$3);
  var jsx$2 = x$1["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(?=\\w+Error\\:).*$\\n", "m"), "");
  var x$2 = $as_T(jsx$2);
  var jsx$1 = x$2["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^@", "gm"), "{anonymous}()@");
  var x$3 = $as_T(jsx$1);
  return x$3["split"]("\n")
});
$c_sjsr_StackTrace$.prototype.loop$1__p1__I__T__T = (function(i, encoded$1) {
  _loop: while (true) {
    if ((i < $uI(this.compressedPrefixes$1["length"]))) {
      var prefix = $as_T(this.compressedPrefixes$1[i]);
      if ((($uI(encoded$1["length"]) >= 0) && ($as_T(encoded$1["substring"](0, $uI(prefix["length"]))) === prefix))) {
        var dict = this.decompressedPrefixes$1;
        if ($uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](dict, prefix))) {
          var jsx$2 = dict[prefix]
        } else {
          var jsx$2;
          throw new $c_ju_NoSuchElementException().init___T(("key not found: " + prefix))
        };
        var jsx$1 = $as_T(jsx$2);
        var beginIndex = $uI(prefix["length"]);
        return (("" + jsx$1) + $as_T(encoded$1["substring"](beginIndex)))
      } else {
        i = ((1 + i) | 0);
        continue _loop
      }
    } else {
      return ((($uI(encoded$1["length"]) >= 0) && ($as_T(encoded$1["substring"](0, $uI("L"["length"]))) === "L")) ? $as_T(encoded$1["substring"](1)) : encoded$1)
    }
  }
});
$c_sjsr_StackTrace$.prototype.liftedTree1$1__p1__Z = (function() {
  try {
    $g["Packages"]["org"]["mozilla"]["javascript"]["JavaScriptException"];
    return true
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      if ($is_sjs_js_JavaScriptException(e$2)) {
        return false
      } else {
        throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
$c_sjsr_StackTrace$.prototype.extractRhino__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var $$this = e["stack"];
  var x = $as_T((($$this === (void 0)) ? "" : $$this));
  var jsx$3 = x["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s+at\\s+", "gm"), "");
  var x$1 = $as_T(jsx$3);
  var jsx$2 = x$1["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(.+?)(?: \\((.+)\\))?$", "gm"), "$2@$1");
  var x$2 = $as_T(jsx$2);
  var jsx$1 = x$2["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("\\r\\n?", "gm"), "\n");
  var x$3 = $as_T(jsx$1);
  return x$3["split"]("\n")
});
$c_sjsr_StackTrace$.prototype.extractOther__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  return []
});
$c_sjsr_StackTrace$.prototype.extractIE__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = $as_T(e["stack"]);
  var jsx$3 = x["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s*at\\s+(.*)$", "gm"), "$1");
  var x$1 = $as_T(jsx$3);
  var jsx$2 = x$1["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^Anonymous function\\s+", "gm"), "{anonymous}() ");
  var x$2 = $as_T(jsx$2);
  var jsx$1 = x$2["replace"]($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+|\\{anonymous\\}\\(\\))\\s+\\((.+)\\)$", "gm"), "$1@$2");
  var x$3 = $as_T(jsx$1);
  var qual$1 = x$3["split"]("\n");
  return qual$1["slice"](1)
});
$c_sjsr_StackTrace$.prototype.decodeMethodName__p1__T__T = (function(encodedName) {
  if ((($uI(encodedName["length"]) >= 0) && ($as_T(encodedName["substring"](0, $uI("init___"["length"]))) === "init___"))) {
    return "<init>"
  } else {
    var methodNameLen = $uI(encodedName["indexOf"]("__"));
    return ((methodNameLen < 0) ? encodedName : $as_T(encodedName["substring"](0, methodNameLen)))
  }
});
var $d_sjsr_StackTrace$ = new $TypeData().initClass({
  sjsr_StackTrace$: 0
}, false, "scala.scalajs.runtime.StackTrace$", {
  sjsr_StackTrace$: 1,
  O: 1
});
$c_sjsr_StackTrace$.prototype.$classData = $d_sjsr_StackTrace$;
var $n_sjsr_StackTrace$ = (void 0);
var $m_sjsr_StackTrace$ = (function() {
  if ((!$n_sjsr_StackTrace$)) {
    $n_sjsr_StackTrace$ = new $c_sjsr_StackTrace$().init___()
  };
  return $n_sjsr_StackTrace$
});
/** @constructor */
var $c_sjsr_StackTrace$StringRE$ = (function() {
  $c_O.call(this)
});
$c_sjsr_StackTrace$StringRE$.prototype = new $h_O();
$c_sjsr_StackTrace$StringRE$.prototype.constructor = $c_sjsr_StackTrace$StringRE$;
/** @constructor */
var $h_sjsr_StackTrace$StringRE$ = (function() {
  /*<skip>*/
});
$h_sjsr_StackTrace$StringRE$.prototype = $c_sjsr_StackTrace$StringRE$.prototype;
$c_sjsr_StackTrace$StringRE$.prototype.re$extension1__T__T__sjs_js_RegExp = (function($$this, mods) {
  return new $g["RegExp"]($$this, mods)
});
$c_sjsr_StackTrace$StringRE$.prototype.re$extension0__T__sjs_js_RegExp = (function($$this) {
  return new $g["RegExp"]($$this)
});
var $d_sjsr_StackTrace$StringRE$ = new $TypeData().initClass({
  sjsr_StackTrace$StringRE$: 0
}, false, "scala.scalajs.runtime.StackTrace$StringRE$", {
  sjsr_StackTrace$StringRE$: 1,
  O: 1
});
$c_sjsr_StackTrace$StringRE$.prototype.$classData = $d_sjsr_StackTrace$StringRE$;
var $n_sjsr_StackTrace$StringRE$ = (void 0);
var $m_sjsr_StackTrace$StringRE$ = (function() {
  if ((!$n_sjsr_StackTrace$StringRE$)) {
    $n_sjsr_StackTrace$StringRE$ = new $c_sjsr_StackTrace$StringRE$().init___()
  };
  return $n_sjsr_StackTrace$StringRE$
});
/** @constructor */
var $c_sjsr_package$ = (function() {
  $c_O.call(this)
});
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
var $h_sjsr_package$ = (function() {
  /*<skip>*/
});
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ($is_sjs_js_JavaScriptException(th)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ($is_jl_Throwable(e)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
var $m_sjsr_package$ = (function() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
});
var $isArrayOf_sr_BoxedUnit = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
});
var $asArrayOf_sr_BoxedUnit = (function(obj, depth) {
  return (($isArrayOf_sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
});
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1
}, (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
var $c_sr_BoxesRunTime$ = (function() {
  $c_O.call(this)
});
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
var $h_sr_BoxesRunTime$ = (function() {
  /*<skip>*/
});
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if ($is_jl_Character(y)) {
    var x2 = $as_jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if ($is_jl_Number(y)) {
    var x3 = $as_jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = $uD(x3);
      return (x2$1 === xc.value$1)
    } else if ($is_sjsr_RuntimeLong(x3)) {
      var x3$1 = $uJ(x3);
      return x3$1.equals__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I(xc.value$1))
    } else {
      return ((x3 === null) ? (xc === null) : $objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if ($is_jl_Number(y)) {
    var x2 = $as_jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if ($is_jl_Character(y)) {
    var x3 = $as_jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = $uD(xn);
      return (x2$1 === x3.value$1)
    } else if ($is_sjsr_RuntimeLong(xn)) {
      var x3$1 = $uJ(xn);
      return x3$1.equals__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I(x3.value$1))
    } else {
      return ((xn === null) ? (x3 === null) : $objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : $objectEquals(xn, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if ($is_jl_Number(x)) {
    var x2 = $as_jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if ($is_jl_Character(x)) {
    var x3 = $as_jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : $objectEquals(x, y))
  }
});
$c_sr_BoxesRunTime$.prototype.hashFromLong__jl_Long__I = (function(n) {
  var iv = $uJ(n).toInt__I();
  return (new $c_sjsr_RuntimeLong().init___I(iv).equals__sjsr_RuntimeLong__Z($uJ(n)) ? iv : $uJ(n).$$up__sjsr_RuntimeLong__sjsr_RuntimeLong($uJ(n).$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I())
});
$c_sr_BoxesRunTime$.prototype.hashFromNumber__jl_Number__I = (function(n) {
  if ($isInt(n)) {
    var x2 = $uI(n);
    return x2
  } else if ($is_sjsr_RuntimeLong(n)) {
    var x3 = $as_sjsr_RuntimeLong(n);
    return this.hashFromLong__jl_Long__I(x3)
  } else if (((typeof n) === "number")) {
    var x4 = $asDouble(n);
    return this.hashFromDouble__jl_Double__I(x4)
  } else {
    return $objectHashCode(n)
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = $uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = $uD(yn);
      return (x2 === x2$2)
    } else if ($is_sjsr_RuntimeLong(yn)) {
      var x3 = $uJ(yn);
      return (x2 === x3.toDouble__D())
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4 = $as_s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if ($is_sjsr_RuntimeLong(xn)) {
    var x3$2 = $uJ(xn);
    if ($is_sjsr_RuntimeLong(yn)) {
      var x2$3 = $uJ(yn);
      return x3$2.equals__sjsr_RuntimeLong__Z(x2$3)
    } else if (((typeof yn) === "number")) {
      var x3$3 = $uD(yn);
      return (x3$2.toDouble__D() === x3$3)
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4$2 = $as_s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(x3$2)
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : $objectEquals(xn, yn))
  }
});
$c_sr_BoxesRunTime$.prototype.hashFromDouble__jl_Double__I = (function(n) {
  var iv = ($uD(n) | 0);
  var dv = $uD(n);
  if ((iv === dv)) {
    return iv
  } else {
    var lv = $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong($uD(n));
    return ((lv.toDouble__D() === dv) ? lv.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(lv.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I() : $m_sjsr_Bits$().numberHashCode__D__I($uD(n)))
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
var $n_sr_BoxesRunTime$ = (void 0);
var $m_sr_BoxesRunTime$ = (function() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
});
var $d_sr_Null$ = new $TypeData().initClass({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
/** @constructor */
var $c_sr_ScalaRunTime$ = (function() {
  $c_O.call(this)
});
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
var $h_sr_ScalaRunTime$ = (function() {
  /*<skip>*/
});
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u["length"]
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u["length"]
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u["length"]
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u["length"]
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u["length"]
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    return x7.u["length"]
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u["length"]
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u["length"]
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u["length"]
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u["length"]
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.hash__O__I = (function(x) {
  return ((x === null) ? 0 : ($is_jl_Number(x) ? $m_sr_BoxesRunTime$().hashFromNumber__jl_Number__I($as_jl_Number(x)) : $objectHashCode(x)))
});
$c_sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    x2.u[idx] = value
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    x3.u[idx] = $uI(value)
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    x4.u[idx] = $uD(value)
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    x5.u[idx] = $uJ(value)
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    x6.u[idx] = $uF(value)
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = $as_jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.u[idx] = jsx$1
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    x8.u[idx] = $uB(value)
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    x9.u[idx] = $uS(value)
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    x10.u[idx] = $uZ(value)
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    x11.u[idx] = $asUnit(value)
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, ",", ")")
});
$c_sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u[idx]
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u[idx]
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u[idx]
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u[idx]
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u[idx]
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    var c = x7.u[idx];
    return new $c_jl_Character().init___C(c)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u[idx]
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u[idx]
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u[idx]
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u[idx]
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
var $m_sr_ScalaRunTime$ = (function() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
});
/** @constructor */
var $c_sr_Statics$ = (function() {
  $c_O.call(this)
});
$c_sr_Statics$.prototype = new $h_O();
$c_sr_Statics$.prototype.constructor = $c_sr_Statics$;
/** @constructor */
var $h_sr_Statics$ = (function() {
  /*<skip>*/
});
$h_sr_Statics$.prototype = $c_sr_Statics$.prototype;
$c_sr_Statics$.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  k = $m_jl_Integer$().rotateLeft__I__I__I(k, 15);
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_sr_Statics$.prototype.avalanche__I__I = (function(h0) {
  var h = h0;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_sr_Statics$.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  h = $m_jl_Integer$().rotateLeft__I__I__I(h, 13);
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_sr_Statics$.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__I__I((hash ^ length))
});
var $d_sr_Statics$ = new $TypeData().initClass({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
$c_sr_Statics$.prototype.$classData = $d_sr_Statics$;
var $n_sr_Statics$ = (void 0);
var $m_sr_Statics$ = (function() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$().init___()
  };
  return $n_sr_Statics$
});
/** @constructor */
var $c_Lexample_ReactApp$ = (function() {
  $c_O.call(this);
  this.navMenu$1 = null;
  this.container$1 = null;
  this.app$1 = null
});
$c_Lexample_ReactApp$.prototype = new $h_O();
$c_Lexample_ReactApp$.prototype.constructor = $c_Lexample_ReactApp$;
/** @constructor */
var $h_Lexample_ReactApp$ = (function() {
  /*<skip>*/
});
$h_Lexample_ReactApp$.prototype = $c_Lexample_ReactApp$.prototype;
$c_Lexample_ReactApp$.prototype.init___ = (function() {
  $n_Lexample_ReactApp$ = this;
  this.navMenu$1 = $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps($m_Ljapgolly_scalajs_react_ReactComponentB$().defaultDomTypeAndProps__Ljapgolly_scalajs_react_ReactComponentB$PSBN__Ljapgolly_scalajs_react_ReactComponentB$Builder(new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("appMenu").render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_Lexample_ReactApp$$anonfun$2().init___())).build__O());
  this.container$1 = $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps($m_Ljapgolly_scalajs_react_ReactComponentB$().defaultDomTypeAndProps__Ljapgolly_scalajs_react_ReactComponentB$PSBN__Ljapgolly_scalajs_react_ReactComponentB$Builder(new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("appMenu").render__F1__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_Lexample_ReactApp$$anonfun$3().init___())).build__O());
  this.app$1 = $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps($m_Ljapgolly_scalajs_react_ReactComponentB$().defaultDomTypeAndProps__Ljapgolly_scalajs_react_ReactComponentB$PSBN__Ljapgolly_scalajs_react_ReactComponentB$Builder(new $c_Ljapgolly_scalajs_react_ReactComponentB$P().init___T("app").initialState__F0__Ljapgolly_scalajs_react_ReactComponentB$PS(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function() {
    return new $c_Lexample_ReactApp$State().init___I(0)
  }))).backend__F1__Ljapgolly_scalajs_react_ReactComponentB$PSB(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$3$2) {
    return new $c_Lexample_ReactApp$Backend().init___Ljapgolly_scalajs_react_BackendScope(x$3$2)
  }))).render__F3__Ljapgolly_scalajs_react_ReactComponentB$PSBN(new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function(P$2, S$2, B$2) {
    var P = $as_sci_List(P$2);
    var S = $as_Lexample_ReactApp$State(S$2);
    $as_Lexample_ReactApp$Backend(B$2);
    var this$4 = $m_Lexample_ReactApp$().container$1;
    var n = S.index$1;
    var props = $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(P, n);
    var array = [];
    var jsx$4 = this$4.jsCtor$2;
    var jsx$3 = this$4.mkProps__O__Ljapgolly_scalajs_react_package$WrapObj(props);
    matchEnd5: {
      var jsx$2;
      var jsx$2 = array;
      break matchEnd5
    };
    var jsx$1 = [jsx$3]["concat"](jsx$2);
    return jsx$4["apply"]((void 0), jsx$1)
  })))).build__O());
  return this
});
$c_Lexample_ReactApp$.prototype.main__V = (function() {
  $g["document"]["title"] = "\u3059\u3054\u3044\u30bf\u30a4\u30e0\u30e9\u30a4\u30f3\u03b8";
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Home", "Examples", "Documentation"]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  this.component__sci_List__Ljapgolly_scalajs_react_ReactComponentM($as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf)))
});
$c_Lexample_ReactApp$.prototype.$$js$exported$meth$main__O = (function() {
  this.main__V()
});
$c_Lexample_ReactApp$.prototype.component__sci_List__Ljapgolly_scalajs_react_ReactComponentM = (function(data) {
  var jsx$6 = $m_Ljapgolly_scalajs_react_package$ReactExt$undReactComponentU$();
  $m_Ljapgolly_scalajs_react_package$();
  var this$1 = this.app$1;
  var array = [];
  var jsx$5 = this$1.jsCtor$2;
  var jsx$4 = this$1.mkProps__O__Ljapgolly_scalajs_react_package$WrapObj(data);
  matchEnd5: {
    var jsx$3;
    var jsx$3 = array;
    break matchEnd5
  };
  var jsx$2 = [jsx$4]["concat"](jsx$3);
  var jsx$1 = jsx$5["apply"]((void 0), jsx$2);
  return jsx$6.render$extension__Ljapgolly_scalajs_react_ReactComponentU__Lorg_scalajs_dom_raw_Node__Ljapgolly_scalajs_react_ReactComponentM(jsx$1, $g["document"]["body"])
});
$c_Lexample_ReactApp$.prototype["main"] = (function() {
  return this.$$js$exported$meth$main__O()
});
var $d_Lexample_ReactApp$ = new $TypeData().initClass({
  Lexample_ReactApp$: 0
}, false, "example.ReactApp$", {
  Lexample_ReactApp$: 1,
  O: 1,
  sjs_js_JSApp: 1
});
$c_Lexample_ReactApp$.prototype.$classData = $d_Lexample_ReactApp$;
var $n_Lexample_ReactApp$ = (void 0);
var $m_Lexample_ReactApp$ = (function() {
  if ((!$n_Lexample_ReactApp$)) {
    $n_Lexample_ReactApp$ = new $c_Lexample_ReactApp$().init___()
  };
  return $n_Lexample_ReactApp$
});
$e["example"] = ($e["example"] || {});
$e["example"]["ReactApp"] = $m_Lexample_ReactApp$;
/** @constructor */
var $c_Ljapgolly_scalajs_react_CompStateAccess$HK = (function() {
  $c_Ljapgolly_scalajs_react_CompStateAccess.call(this)
});
$c_Ljapgolly_scalajs_react_CompStateAccess$HK.prototype = new $h_Ljapgolly_scalajs_react_CompStateAccess();
$c_Ljapgolly_scalajs_react_CompStateAccess$HK.prototype.constructor = $c_Ljapgolly_scalajs_react_CompStateAccess$HK;
/** @constructor */
var $h_Ljapgolly_scalajs_react_CompStateAccess$HK = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_CompStateAccess$HK.prototype = $c_Ljapgolly_scalajs_react_CompStateAccess$HK.prototype;
/** @constructor */
var $c_Ljapgolly_scalajs_react_package$ = (function() {
  $c_O.call(this);
  this.preventDefaultF$1 = null;
  this.stopPropagationF$1 = null
});
$c_Ljapgolly_scalajs_react_package$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_package$.prototype.constructor = $c_Ljapgolly_scalajs_react_package$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_package$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_package$.prototype = $c_Ljapgolly_scalajs_react_package$.prototype;
$c_Ljapgolly_scalajs_react_package$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_package$ = this;
  this.preventDefaultF$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$1$2) {
    x$1$2["preventDefault"]()
  }));
  this.stopPropagationF$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$2$2) {
    x$2$2["stopPropagation"]()
  }));
  return this
});
$c_Ljapgolly_scalajs_react_package$.prototype.WrapObj__O__Ljapgolly_scalajs_react_package$WrapObj = (function(v) {
  return {
    "v": v
  }
});
var $d_Ljapgolly_scalajs_react_package$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_package$: 0
}, false, "japgolly.scalajs.react.package$", {
  Ljapgolly_scalajs_react_package$: 1,
  O: 1,
  Ljapgolly_scalajs_react_ReactEventAliases: 1
});
$c_Ljapgolly_scalajs_react_package$.prototype.$classData = $d_Ljapgolly_scalajs_react_package$;
var $n_Ljapgolly_scalajs_react_package$ = (void 0);
var $m_Ljapgolly_scalajs_react_package$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_package$)) {
    $n_Ljapgolly_scalajs_react_package$ = new $c_Ljapgolly_scalajs_react_package$().init___()
  };
  return $n_Ljapgolly_scalajs_react_package$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2 = (function() {
  $c_O.call(this);
  this.t$1$1 = null;
  this.av$1$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2.prototype = $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2.prototype.init___O__Ljapgolly_scalajs_react_vdom_AttrValue = (function(t$1, av$1) {
  this.t$1$1 = t$1;
  this.av$1$1 = av$1;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  var this$1 = this.av$1$1;
  var v = this.t$1$1;
  var arg1 = this$1.f$1.apply__O__O(v);
  b.addClassName__sjs_js_Any__V(arg1)
});
var $d_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2: 0
}, false, "japgolly.scalajs.react.vdom.ClassNameAttr$$anon$2", {
  Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Implicits = (function() {
  $c_Ljapgolly_scalajs_react_vdom_LowPri.call(this);
  this.$$undreact$undattrBoolean$2 = null;
  this.$$undreact$undattrByte$2 = null;
  this.$$undreact$undattrShort$2 = null;
  this.$$undreact$undattrInt$2 = null;
  this.$$undreact$undattrLong$2 = null;
  this.$$undreact$undattrFloat$2 = null;
  this.$$undreact$undattrDouble$2 = null;
  this.$$undreact$undattrJsThisFn$2 = null;
  this.$$undreact$undattrJsFn$2 = null;
  this.$$undreact$undattrJsObj$2 = null;
  this.$$undreact$undstyleBoolean$2 = null;
  this.$$undreact$undstyleByte$2 = null;
  this.$$undreact$undstyleShort$2 = null;
  this.$$undreact$undstyleInt$2 = null;
  this.$$undreact$undstyleLong$2 = null;
  this.$$undreact$undstyleFloat$2 = null;
  this.$$undreact$undstyleDouble$2 = null
});
$c_Ljapgolly_scalajs_react_vdom_Implicits.prototype = new $h_Ljapgolly_scalajs_react_vdom_LowPri();
$c_Ljapgolly_scalajs_react_vdom_Implicits.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Implicits;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Implicits = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Implicits.prototype = $c_Ljapgolly_scalajs_react_vdom_Implicits.prototype;
$c_Ljapgolly_scalajs_react_vdom_Implicits.prototype.init___ = (function() {
  var evidence$2 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(value$2) {
    var value = $uZ(value$2);
    return value
  }));
  this.$$undreact$undattrBoolean$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1) {
    return (function(a$2) {
      return evidence$2$1.apply__O__O(a$2)
    })
  })(evidence$2)));
  var evidence$2$2 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(v$2) {
    var v = $uB(v$2);
    $m_Ljapgolly_scalajs_react_package$();
    return v
  }));
  this.$$undreact$undattrByte$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$1) {
    return (function(a$2$1) {
      return evidence$2$1$1.apply__O__O(a$2$1)
    })
  })(evidence$2$2)));
  var evidence$2$3 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(v$2$1) {
    var v$1 = $uS(v$2$1);
    $m_Ljapgolly_scalajs_react_package$();
    return v$1
  }));
  this.$$undreact$undattrShort$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$2) {
    return (function(a$2$2) {
      return evidence$2$1$2.apply__O__O(a$2$2)
    })
  })(evidence$2$3)));
  var evidence$2$4 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(v$2$2) {
    var v$3 = $uI(v$2$2);
    $m_Ljapgolly_scalajs_react_package$();
    return v$3
  }));
  this.$$undreact$undattrInt$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$3) {
    return (function(a$2$3) {
      return evidence$2$1$3.apply__O__O(a$2$3)
    })
  })(evidence$2$4)));
  var evidence$2$5 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(v$2$3) {
    var v$4 = $uJ(v$2$3);
    $m_Ljapgolly_scalajs_react_package$();
    return $as_sjsr_RuntimeLong(v$4).toString__T()
  }));
  this.$$undreact$undattrLong$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$4) {
    return (function(a$2$4) {
      return evidence$2$1$4.apply__O__O(a$2$4)
    })
  })(evidence$2$5)));
  var evidence$2$6 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(v$2$4) {
    var v$5 = $uF(v$2$4);
    $m_Ljapgolly_scalajs_react_package$();
    return v$5
  }));
  this.$$undreact$undattrFloat$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$5) {
    return (function(a$2$5) {
      return evidence$2$1$5.apply__O__O(a$2$5)
    })
  })(evidence$2$6)));
  var evidence$2$7 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(v$2$5) {
    var v$6 = $uD(v$2$5);
    $m_Ljapgolly_scalajs_react_package$();
    return v$6
  }));
  this.$$undreact$undattrDouble$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$6) {
    return (function(a$2$6) {
      return evidence$2$1$6.apply__O__O(a$2$6)
    })
  })(evidence$2$7)));
  var evidence$2$8 = $m_s_Predef$().singleton$und$less$colon$less$2;
  this.$$undreact$undattrJsThisFn$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$7) {
    return (function(a$2$7) {
      return evidence$2$1$7.apply__O__O(a$2$7)
    })
  })(evidence$2$8)));
  var evidence$2$9 = $m_s_Predef$().singleton$und$less$colon$less$2;
  this.$$undreact$undattrJsFn$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$8) {
    return (function(a$2$8) {
      return evidence$2$1$8.apply__O__O(a$2$8)
    })
  })(evidence$2$9)));
  var evidence$2$10 = $m_s_Predef$().singleton$und$less$colon$less$2;
  this.$$undreact$undattrJsObj$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(evidence$2$1$9) {
    return (function(a$2$9) {
      return evidence$2$1$9.apply__O__O(a$2$9)
    })
  })(evidence$2$10)));
  this.$$undreact$undstyleBoolean$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$9$2) {
    return $objectToString(x$9$2)
  })));
  this.$$undreact$undstyleByte$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$9$2$1) {
    return $objectToString(x$9$2$1)
  })));
  this.$$undreact$undstyleShort$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$9$2$2) {
    return $objectToString(x$9$2$2)
  })));
  this.$$undreact$undstyleInt$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$9$2$3) {
    return $objectToString(x$9$2$3)
  })));
  this.$$undreact$undstyleLong$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$9$2$4) {
    return $objectToString(x$9$2$4)
  })));
  this.$$undreact$undstyleFloat$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$9$2$5) {
    return $objectToString(x$9$2$5)
  })));
  this.$$undreact$undstyleDouble$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$9$2$6) {
    return $objectToString(x$9$2$6)
  })));
  return this
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr = (function() {
  $c_O.call(this);
  this.f$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr.prototype = $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr.prototype;
$c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr.prototype.init___F1 = (function(f) {
  this.f$1 = f;
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr: 0
}, false, "japgolly.scalajs.react.vdom.Scalatags$GenericAttr", {
  Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_AttrValue: 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Scalatags$GenericAttr;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle = (function() {
  $c_O.call(this);
  this.f$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle.prototype = $c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle.prototype;
$c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle.prototype.init___F1 = (function(f) {
  this.f$1 = f;
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle: 0
}, false, "japgolly.scalajs.react.vdom.Scalatags$GenericStyle", {
  Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_StyleValue: 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Scalatags$GenericStyle;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1 = (function() {
  $c_O.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1.prototype = $c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1.prototype;
var $d_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1: 0
}, false, "japgolly.scalajs.react.vdom.Scalatags$NamespaceHtml$$anon$1", {
  Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Scalatags$Namespace: 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Scalatags$NamespaceHtml$$anon$1;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode = (function() {
  $c_O.call(this);
  this.xs$1 = null;
  this.japgolly$scalajs$react$vdom$Scalatags$SeqNode$$evidence$4$f = null
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode.prototype = $c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode.prototype;
$c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode.prototype.init___sc_Seq__F1 = (function(xs, evidence$4) {
  this.xs$1 = xs;
  this.japgolly$scalajs$react$vdom$Scalatags$SeqNode$$evidence$4$f = evidence$4;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(t) {
  this.xs$1.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer, t$4) {
    return (function(x$10$2) {
      $as_Ljapgolly_scalajs_react_vdom_TagMod(arg$outer.japgolly$scalajs$react$vdom$Scalatags$SeqNode$$evidence$4$f.apply__O__O(x$10$2)).applyTo__Ljapgolly_scalajs_react_vdom_Builder__V(t$4)
    })
  })(this, t)))
});
var $d_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode: 0
}, false, "japgolly.scalajs.react.vdom.Scalatags$SeqNode", {
  Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode;
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
var $c_jl_Character = (function() {
  $c_O.call(this);
  this.value$1 = 0
});
$c_jl_Character.prototype = new $h_O();
$c_jl_Character.prototype.constructor = $c_jl_Character;
/** @constructor */
var $h_jl_Character = (function() {
  /*<skip>*/
});
$h_jl_Character.prototype = $c_jl_Character.prototype;
$c_jl_Character.prototype.equals__O__Z = (function(that) {
  if ($is_jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = $as_jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
$c_jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return $as_T($g["String"]["fromCharCode"](c))
});
$c_jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
$c_jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
var $is_jl_Character = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
});
var $as_jl_Character = (function(obj) {
  return (($is_jl_Character(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Character"))
});
var $isArrayOf_jl_Character = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
});
var $asArrayOf_jl_Character = (function(obj, depth) {
  return (($isArrayOf_jl_Character(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Character;", depth))
});
var $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
/** @constructor */
var $c_jl_InheritableThreadLocal = (function() {
  $c_jl_ThreadLocal.call(this)
});
$c_jl_InheritableThreadLocal.prototype = new $h_jl_ThreadLocal();
$c_jl_InheritableThreadLocal.prototype.constructor = $c_jl_InheritableThreadLocal;
/** @constructor */
var $h_jl_InheritableThreadLocal = (function() {
  /*<skip>*/
});
$h_jl_InheritableThreadLocal.prototype = $c_jl_InheritableThreadLocal.prototype;
/** @constructor */
var $c_jl_StackTraceElement = (function() {
  $c_O.call(this);
  this.declaringClass$1 = null;
  this.methodName$1 = null;
  this.fileName$1 = null;
  this.lineNumber$1 = 0;
  this.columnNumber$1 = 0
});
$c_jl_StackTraceElement.prototype = new $h_O();
$c_jl_StackTraceElement.prototype.constructor = $c_jl_StackTraceElement;
/** @constructor */
var $h_jl_StackTraceElement = (function() {
  /*<skip>*/
});
$h_jl_StackTraceElement.prototype = $c_jl_StackTraceElement.prototype;
$c_jl_StackTraceElement.prototype.$$js$exported$meth$getColumnNumber__O = (function() {
  return this.columnNumber$1
});
$c_jl_StackTraceElement.prototype.init___T__T__T__I = (function(declaringClass, methodName, fileName, lineNumber) {
  this.declaringClass$1 = declaringClass;
  this.methodName$1 = methodName;
  this.fileName$1 = fileName;
  this.lineNumber$1 = lineNumber;
  this.columnNumber$1 = (-1);
  return this
});
$c_jl_StackTraceElement.prototype.equals__O__Z = (function(that) {
  if ($is_jl_StackTraceElement(that)) {
    var x2 = $as_jl_StackTraceElement(that);
    return ((((this.fileName$1 === x2.fileName$1) && (this.lineNumber$1 === x2.lineNumber$1)) && (this.declaringClass$1 === x2.declaringClass$1)) && (this.methodName$1 === x2.methodName$1))
  } else {
    return false
  }
});
$c_jl_StackTraceElement.prototype.$$js$exported$meth$setColumnNumber__I__O = (function(columnNumber) {
  this.columnNumber$1 = columnNumber
});
$c_jl_StackTraceElement.prototype.toString__T = (function() {
  var result = "";
  if ((this.declaringClass$1 !== "<jscode>")) {
    result = (result + (this.declaringClass$1 + "."))
  };
  result = (("" + result) + this.methodName$1);
  if ((this.fileName$1 === null)) {
    result = (result + "(Unknown Source)")
  } else {
    result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["(", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.fileName$1])));
    if ((this.lineNumber$1 >= 0)) {
      result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array([":", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.lineNumber$1])));
      if ((this.columnNumber$1 >= 0)) {
        result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array([":", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.columnNumber$1])))
      }
    };
    result = (result + ")")
  };
  return result
});
$c_jl_StackTraceElement.prototype.hashCode__I = (function() {
  var this$1 = this.declaringClass$1;
  var jsx$1 = $m_sjsr_RuntimeString$().hashCode__T__I(this$1);
  var this$2 = this.methodName$1;
  return (jsx$1 ^ $m_sjsr_RuntimeString$().hashCode__T__I(this$2))
});
$c_jl_StackTraceElement.prototype["getColumnNumber"] = (function() {
  return this.$$js$exported$meth$getColumnNumber__O()
});
$c_jl_StackTraceElement.prototype["setColumnNumber"] = (function(arg$1) {
  if ((arg$1 === null)) {
    var prep0;
    throw "Found null, expected Int"
  } else {
    var prep0 = $uI(arg$1)
  };
  return this.$$js$exported$meth$setColumnNumber__I__O(prep0)
});
var $is_jl_StackTraceElement = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_StackTraceElement)))
});
var $as_jl_StackTraceElement = (function(obj) {
  return (($is_jl_StackTraceElement(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.StackTraceElement"))
});
var $isArrayOf_jl_StackTraceElement = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_StackTraceElement)))
});
var $asArrayOf_jl_StackTraceElement = (function(obj, depth) {
  return (($isArrayOf_jl_StackTraceElement(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.StackTraceElement;", depth))
});
var $d_jl_StackTraceElement = new $TypeData().initClass({
  jl_StackTraceElement: 0
}, false, "java.lang.StackTraceElement", {
  jl_StackTraceElement: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StackTraceElement.prototype.$classData = $d_jl_StackTraceElement;
/** @constructor */
var $c_jl_Throwable = (function() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
});
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
var $h_jl_Throwable = (function() {
  /*<skip>*/
});
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var this$1 = $m_sjsr_StackTrace$();
  this$1.captureState__jl_Throwable__O__V(this, this$1.createException__p1__O());
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.getStackTrace__Ajl_StackTraceElement = (function() {
  if ((this.stackTrace$1 === null)) {
    this.stackTrace$1 = $m_sjsr_StackTrace$().extract__jl_Throwable__Ajl_StackTraceElement(this)
  };
  return this.stackTrace$1
});
$c_jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
$c_jl_Throwable.prototype.printStackTrace__Ljava_io_PrintStream__V = (function(s) {
  var f = (function(this$2, s$1) {
    return (function(x$1$2) {
      var x$1 = $as_T(x$1$2);
      s$1.println__T__V(x$1)
    })
  })(this, s);
  this.getStackTrace__Ajl_StackTraceElement();
  var arg1 = this.toString__T();
  f(arg1);
  if ((this.stackTrace$1.u["length"] !== 0)) {
    var i = 0;
    while ((i < this.stackTrace$1.u["length"])) {
      var arg1$1 = ("  at " + this.stackTrace$1.u[i]);
      f(arg1$1);
      i = ((1 + i) | 0)
    }
  } else {
    f("  <no stack trace available>")
  };
  var wCause = this;
  while (true) {
    var jsx$2 = wCause;
    var this$1 = wCause;
    if ((jsx$2 !== this$1.e$1)) {
      var this$3 = wCause;
      var jsx$1 = (this$3.e$1 !== null)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var parentTrace = wCause.getStackTrace__Ajl_StackTraceElement();
      var this$4 = wCause;
      wCause = this$4.e$1;
      var thisTrace = wCause.getStackTrace__Ajl_StackTraceElement();
      var thisLength = thisTrace.u["length"];
      var parentLength = parentTrace.u["length"];
      var arg1$2 = ("Caused by: " + wCause.toString__T());
      f(arg1$2);
      if ((thisLength !== 0)) {
        var sameFrameCount = 0;
        while (true) {
          if (((sameFrameCount < thisLength) && (sameFrameCount < parentLength))) {
            var x = thisTrace.u[(((-1) + ((thisLength - sameFrameCount) | 0)) | 0)];
            var x$2 = parentTrace.u[(((-1) + ((parentLength - sameFrameCount) | 0)) | 0)];
            var jsx$3 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
          } else {
            var jsx$3 = false
          };
          if (jsx$3) {
            sameFrameCount = ((1 + sameFrameCount) | 0)
          } else {
            break
          }
        };
        if ((sameFrameCount > 0)) {
          sameFrameCount = (((-1) + sameFrameCount) | 0)
        };
        var lengthToPrint = ((thisLength - sameFrameCount) | 0);
        var i$2 = 0;
        while ((i$2 < lengthToPrint)) {
          var arg1$3 = ("  at " + thisTrace.u[i$2]);
          f(arg1$3);
          i$2 = ((1 + i$2) | 0)
        };
        if ((sameFrameCount > 0)) {
          var arg1$4 = (("  ... " + sameFrameCount) + " more");
          f(arg1$4)
        }
      } else {
        f("  <no stack trace available>")
      }
    } else {
      break
    }
  }
});
var $is_jl_Throwable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
});
var $as_jl_Throwable = (function(obj) {
  return (($is_jl_Throwable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
});
var $isArrayOf_jl_Throwable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
});
var $asArrayOf_jl_Throwable = (function(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
});
/** @constructor */
var $c_ju_regex_Matcher = (function() {
  $c_O.call(this);
  this.pattern0$1 = null;
  this.input0$1 = null;
  this.regionStart0$1 = 0;
  this.regionEnd0$1 = 0;
  this.regexp$1 = null;
  this.inputstr$1 = null;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = false;
  this.appendPos$1 = 0
});
$c_ju_regex_Matcher.prototype = new $h_O();
$c_ju_regex_Matcher.prototype.constructor = $c_ju_regex_Matcher;
/** @constructor */
var $h_ju_regex_Matcher = (function() {
  /*<skip>*/
});
$h_ju_regex_Matcher.prototype = $c_ju_regex_Matcher.prototype;
$c_ju_regex_Matcher.prototype.find__Z = (function() {
  if (this.canStillFind$1) {
    this.lastMatchIsValid$1 = true;
    this.lastMatch$1 = this.regexp$1["exec"](this.inputstr$1);
    if ((this.lastMatch$1 !== null)) {
      var $$this = this.lastMatch$1[0];
      if (($$this === (void 0))) {
        var jsx$1;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$1 = $$this
      };
      var thiz = $as_T(jsx$1);
      if ((thiz === null)) {
        var jsx$2;
        throw new $c_jl_NullPointerException().init___()
      } else {
        var jsx$2 = thiz
      };
      if ((jsx$2 === "")) {
        var ev$1 = this.regexp$1;
        ev$1["lastIndex"] = ((1 + $uI(ev$1["lastIndex"])) | 0)
      }
    } else {
      this.canStillFind$1 = false
    };
    return (this.lastMatch$1 !== null)
  } else {
    return false
  }
});
$c_ju_regex_Matcher.prototype.ensureLastMatch__p1__sjs_js_RegExp$ExecResult = (function() {
  if ((this.lastMatch$1 === null)) {
    throw new $c_jl_IllegalStateException().init___T("No match available")
  };
  return this.lastMatch$1
});
$c_ju_regex_Matcher.prototype.matches__Z = (function() {
  this.reset__ju_regex_Matcher();
  this.find__Z();
  if ((this.lastMatch$1 !== null)) {
    if ((this.start__I() !== 0)) {
      var jsx$1 = true
    } else {
      var jsx$2 = this.end__I();
      var thiz = this.inputstr$1;
      var jsx$1 = (jsx$2 !== $uI(thiz["length"]))
    }
  } else {
    var jsx$1 = false
  };
  if (jsx$1) {
    this.reset__ju_regex_Matcher()
  };
  return (this.lastMatch$1 !== null)
});
$c_ju_regex_Matcher.prototype.end__I = (function() {
  var jsx$1 = this.start__I();
  var thiz = this.group__T();
  return ((jsx$1 + $uI(thiz["length"])) | 0)
});
$c_ju_regex_Matcher.prototype.init___ju_regex_Pattern__jl_CharSequence__I__I = (function(pattern0, input0, regionStart0, regionEnd0) {
  this.pattern0$1 = pattern0;
  this.input0$1 = input0;
  this.regionStart0$1 = regionStart0;
  this.regionEnd0$1 = regionEnd0;
  this.regexp$1 = new $g["RegExp"](this.pattern0$1.jspattern$1, this.pattern0$1.jsflags$1);
  this.inputstr$1 = $objectToString($charSequenceSubSequence(this.input0$1, this.regionStart0$1, this.regionEnd0$1));
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  return this
});
$c_ju_regex_Matcher.prototype.group__T = (function() {
  var $$this = this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult()[0];
  if (($$this === (void 0))) {
    var jsx$1;
    throw new $c_ju_NoSuchElementException().init___T("undefined.get")
  } else {
    var jsx$1 = $$this
  };
  return $as_T(jsx$1)
});
$c_ju_regex_Matcher.prototype.start__I = (function() {
  return $uI(this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult()["index"])
});
$c_ju_regex_Matcher.prototype.reset__ju_regex_Matcher = (function() {
  this.regexp$1["lastIndex"] = 0;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  return this
});
var $d_ju_regex_Matcher = new $TypeData().initClass({
  ju_regex_Matcher: 0
}, false, "java.util.regex.Matcher", {
  ju_regex_Matcher: 1,
  O: 1,
  ju_regex_MatchResult: 1
});
$c_ju_regex_Matcher.prototype.$classData = $d_ju_regex_Matcher;
/** @constructor */
var $c_s_Predef$$anon$3 = (function() {
  $c_O.call(this)
});
$c_s_Predef$$anon$3.prototype = new $h_O();
$c_s_Predef$$anon$3.prototype.constructor = $c_s_Predef$$anon$3;
/** @constructor */
var $h_s_Predef$$anon$3 = (function() {
  /*<skip>*/
});
$h_s_Predef$$anon$3.prototype = $c_s_Predef$$anon$3.prototype;
$c_s_Predef$$anon$3.prototype.apply__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_s_Predef$$anon$3.prototype.apply__O__scm_Builder = (function(from) {
  $as_T(from);
  return new $c_scm_StringBuilder().init___()
});
var $d_s_Predef$$anon$3 = new $TypeData().initClass({
  s_Predef$$anon$3: 0
}, false, "scala.Predef$$anon$3", {
  s_Predef$$anon$3: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_s_Predef$$anon$3.prototype.$classData = $d_s_Predef$$anon$3;
var $is_s_math_ScalaNumber = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
});
var $as_s_math_ScalaNumber = (function(obj) {
  return (($is_s_math_ScalaNumber(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.math.ScalaNumber"))
});
var $isArrayOf_s_math_ScalaNumber = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
});
var $asArrayOf_s_math_ScalaNumber = (function(obj, depth) {
  return (($isArrayOf_s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
});
/** @constructor */
var $c_s_package$$anon$1 = (function() {
  $c_O.call(this)
});
$c_s_package$$anon$1.prototype = new $h_O();
$c_s_package$$anon$1.prototype.constructor = $c_s_package$$anon$1;
/** @constructor */
var $h_s_package$$anon$1 = (function() {
  /*<skip>*/
});
$h_s_package$$anon$1.prototype = $c_s_package$$anon$1.prototype;
$c_s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
var $d_s_package$$anon$1 = new $TypeData().initClass({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
$c_s_package$$anon$1.prototype.$classData = $d_s_package$$anon$1;
/** @constructor */
var $c_s_util_hashing_MurmurHash3$ = (function() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.arraySeed$2 = 0;
  this.stringSeed$2 = 0;
  this.productSeed$2 = 0;
  this.symmetricSeed$2 = 0;
  this.traversableSeed$2 = 0;
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
});
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
var $h_s_util_hashing_MurmurHash3$ = (function() {
  /*<skip>*/
});
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
$c_s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if ($is_sci_List(xs)) {
    var x2 = $as_sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
var $m_s_util_hashing_MurmurHash3$ = (function() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
});
/** @constructor */
var $c_scg_GenMapFactory$MapCanBuildFrom = (function() {
  $c_O.call(this);
  this.$$outer$f = null
});
$c_scg_GenMapFactory$MapCanBuildFrom.prototype = new $h_O();
$c_scg_GenMapFactory$MapCanBuildFrom.prototype.constructor = $c_scg_GenMapFactory$MapCanBuildFrom;
/** @constructor */
var $h_scg_GenMapFactory$MapCanBuildFrom = (function() {
  /*<skip>*/
});
$h_scg_GenMapFactory$MapCanBuildFrom.prototype = $c_scg_GenMapFactory$MapCanBuildFrom.prototype;
$c_scg_GenMapFactory$MapCanBuildFrom.prototype.apply__scm_Builder = (function() {
  var this$1 = this.$$outer$f;
  return new $c_scm_MapBuilder().init___sc_GenMap(this$1.empty__sc_GenMap())
});
$c_scg_GenMapFactory$MapCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  $as_sc_GenMap(from);
  var this$1 = this.$$outer$f;
  return new $c_scm_MapBuilder().init___sc_GenMap(this$1.empty__sc_GenMap())
});
$c_scg_GenMapFactory$MapCanBuildFrom.prototype.init___scg_GenMapFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
var $d_scg_GenMapFactory$MapCanBuildFrom = new $TypeData().initClass({
  scg_GenMapFactory$MapCanBuildFrom: 0
}, false, "scala.collection.generic.GenMapFactory$MapCanBuildFrom", {
  scg_GenMapFactory$MapCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenMapFactory$MapCanBuildFrom.prototype.$classData = $d_scg_GenMapFactory$MapCanBuildFrom;
/** @constructor */
var $c_scg_GenSetFactory = (function() {
  $c_scg_GenericCompanion.call(this)
});
$c_scg_GenSetFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenSetFactory.prototype.constructor = $c_scg_GenSetFactory;
/** @constructor */
var $h_scg_GenSetFactory = (function() {
  /*<skip>*/
});
$h_scg_GenSetFactory.prototype = $c_scg_GenSetFactory.prototype;
/** @constructor */
var $c_scg_GenTraversableFactory = (function() {
  $c_scg_GenericCompanion.call(this);
  this.ReusableCBFInstance$2 = null
});
$c_scg_GenTraversableFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenTraversableFactory.prototype.constructor = $c_scg_GenTraversableFactory;
/** @constructor */
var $h_scg_GenTraversableFactory = (function() {
  /*<skip>*/
});
$h_scg_GenTraversableFactory.prototype = $c_scg_GenTraversableFactory.prototype;
$c_scg_GenTraversableFactory.prototype.init___ = (function() {
  this.ReusableCBFInstance$2 = new $c_scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
  return this
});
/** @constructor */
var $c_scg_GenTraversableFactory$GenericCanBuildFrom = (function() {
  $c_O.call(this);
  this.$$outer$f = null
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = new $h_O();
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.constructor = $c_scg_GenTraversableFactory$GenericCanBuildFrom;
/** @constructor */
var $h_scg_GenTraversableFactory$GenericCanBuildFrom = (function() {
  /*<skip>*/
});
$h_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype;
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$f.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  var from$1 = $as_sc_GenTraversable(from);
  return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
/** @constructor */
var $c_scg_MapFactory = (function() {
  $c_scg_GenMapFactory.call(this)
});
$c_scg_MapFactory.prototype = new $h_scg_GenMapFactory();
$c_scg_MapFactory.prototype.constructor = $c_scg_MapFactory;
/** @constructor */
var $h_scg_MapFactory = (function() {
  /*<skip>*/
});
$h_scg_MapFactory.prototype = $c_scg_MapFactory.prototype;
/** @constructor */
var $c_sci_HashMap$$anon$2 = (function() {
  $c_sci_HashMap$Merger.call(this);
  this.invert$2 = null;
  this.mergef$1$f = null
});
$c_sci_HashMap$$anon$2.prototype = new $h_sci_HashMap$Merger();
$c_sci_HashMap$$anon$2.prototype.constructor = $c_sci_HashMap$$anon$2;
/** @constructor */
var $h_sci_HashMap$$anon$2 = (function() {
  /*<skip>*/
});
$h_sci_HashMap$$anon$2.prototype = $c_sci_HashMap$$anon$2.prototype;
$c_sci_HashMap$$anon$2.prototype.init___F2 = (function(mergef$1) {
  this.mergef$1$f = mergef$1;
  this.invert$2 = new $c_sci_HashMap$$anon$2$$anon$3().init___sci_HashMap$$anon$2(this);
  return this
});
$c_sci_HashMap$$anon$2.prototype.apply__T2__T2__T2 = (function(kv1, kv2) {
  return $as_T2(this.mergef$1$f.apply__O__O__O(kv1, kv2))
});
var $d_sci_HashMap$$anon$2 = new $TypeData().initClass({
  sci_HashMap$$anon$2: 0
}, false, "scala.collection.immutable.HashMap$$anon$2", {
  sci_HashMap$$anon$2: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
$c_sci_HashMap$$anon$2.prototype.$classData = $d_sci_HashMap$$anon$2;
/** @constructor */
var $c_sci_HashMap$$anon$2$$anon$3 = (function() {
  $c_sci_HashMap$Merger.call(this);
  this.$$outer$2 = null
});
$c_sci_HashMap$$anon$2$$anon$3.prototype = new $h_sci_HashMap$Merger();
$c_sci_HashMap$$anon$2$$anon$3.prototype.constructor = $c_sci_HashMap$$anon$2$$anon$3;
/** @constructor */
var $h_sci_HashMap$$anon$2$$anon$3 = (function() {
  /*<skip>*/
});
$h_sci_HashMap$$anon$2$$anon$3.prototype = $c_sci_HashMap$$anon$2$$anon$3.prototype;
$c_sci_HashMap$$anon$2$$anon$3.prototype.apply__T2__T2__T2 = (function(kv1, kv2) {
  return $as_T2(this.$$outer$2.mergef$1$f.apply__O__O__O(kv2, kv1))
});
$c_sci_HashMap$$anon$2$$anon$3.prototype.init___sci_HashMap$$anon$2 = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  return this
});
var $d_sci_HashMap$$anon$2$$anon$3 = new $TypeData().initClass({
  sci_HashMap$$anon$2$$anon$3: 0
}, false, "scala.collection.immutable.HashMap$$anon$2$$anon$3", {
  sci_HashMap$$anon$2$$anon$3: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
$c_sci_HashMap$$anon$2$$anon$3.prototype.$classData = $d_sci_HashMap$$anon$2$$anon$3;
/** @constructor */
var $c_sci_List$$anon$1 = (function() {
  $c_O.call(this)
});
$c_sci_List$$anon$1.prototype = new $h_O();
$c_sci_List$$anon$1.prototype.constructor = $c_sci_List$$anon$1;
/** @constructor */
var $h_sci_List$$anon$1 = (function() {
  /*<skip>*/
});
$h_sci_List$$anon$1.prototype = $c_sci_List$$anon$1.prototype;
$c_sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
$c_sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
$c_sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
var $d_sci_List$$anon$1 = new $TypeData().initClass({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
$c_sci_List$$anon$1.prototype.$classData = $d_sci_List$$anon$1;
var $is_scm_Builder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
});
var $as_scm_Builder = (function(obj) {
  return (($is_scm_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Builder"))
});
var $isArrayOf_scm_Builder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
});
var $asArrayOf_scm_Builder = (function(obj, depth) {
  return (($isArrayOf_scm_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
});
/** @constructor */
var $c_sr_AbstractFunction0 = (function() {
  $c_O.call(this)
});
$c_sr_AbstractFunction0.prototype = new $h_O();
$c_sr_AbstractFunction0.prototype.constructor = $c_sr_AbstractFunction0;
/** @constructor */
var $h_sr_AbstractFunction0 = (function() {
  /*<skip>*/
});
$h_sr_AbstractFunction0.prototype = $c_sr_AbstractFunction0.prototype;
$c_sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
var $c_sr_AbstractFunction1 = (function() {
  $c_O.call(this)
});
$c_sr_AbstractFunction1.prototype = new $h_O();
$c_sr_AbstractFunction1.prototype.constructor = $c_sr_AbstractFunction1;
/** @constructor */
var $h_sr_AbstractFunction1 = (function() {
  /*<skip>*/
});
$h_sr_AbstractFunction1.prototype = $c_sr_AbstractFunction1.prototype;
$c_sr_AbstractFunction1.prototype.init___ = (function() {
  return this
});
$c_sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
var $c_sr_AbstractFunction2 = (function() {
  $c_O.call(this)
});
$c_sr_AbstractFunction2.prototype = new $h_O();
$c_sr_AbstractFunction2.prototype.constructor = $c_sr_AbstractFunction2;
/** @constructor */
var $h_sr_AbstractFunction2 = (function() {
  /*<skip>*/
});
$h_sr_AbstractFunction2.prototype = $c_sr_AbstractFunction2.prototype;
$c_sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
/** @constructor */
var $c_sr_AbstractFunction3 = (function() {
  $c_O.call(this)
});
$c_sr_AbstractFunction3.prototype = new $h_O();
$c_sr_AbstractFunction3.prototype.constructor = $c_sr_AbstractFunction3;
/** @constructor */
var $h_sr_AbstractFunction3 = (function() {
  /*<skip>*/
});
$h_sr_AbstractFunction3.prototype = $c_sr_AbstractFunction3.prototype;
$c_sr_AbstractFunction3.prototype.toString__T = (function() {
  return "<function3>"
});
/** @constructor */
var $c_sr_BooleanRef = (function() {
  $c_O.call(this);
  this.elem$1 = false
});
$c_sr_BooleanRef.prototype = new $h_O();
$c_sr_BooleanRef.prototype.constructor = $c_sr_BooleanRef;
/** @constructor */
var $h_sr_BooleanRef = (function() {
  /*<skip>*/
});
$h_sr_BooleanRef.prototype = $c_sr_BooleanRef.prototype;
$c_sr_BooleanRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
$c_sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_BooleanRef = new $TypeData().initClass({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_BooleanRef.prototype.$classData = $d_sr_BooleanRef;
/** @constructor */
var $c_sr_IntRef = (function() {
  $c_O.call(this);
  this.elem$1 = 0
});
$c_sr_IntRef.prototype = new $h_O();
$c_sr_IntRef.prototype.constructor = $c_sr_IntRef;
/** @constructor */
var $h_sr_IntRef = (function() {
  /*<skip>*/
});
$h_sr_IntRef.prototype = $c_sr_IntRef.prototype;
$c_sr_IntRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
$c_sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_IntRef = new $TypeData().initClass({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_IntRef.prototype.$classData = $d_sr_IntRef;
/** @constructor */
var $c_sr_ObjectRef = (function() {
  $c_O.call(this);
  this.elem$1 = null
});
$c_sr_ObjectRef.prototype = new $h_O();
$c_sr_ObjectRef.prototype.constructor = $c_sr_ObjectRef;
/** @constructor */
var $h_sr_ObjectRef = (function() {
  /*<skip>*/
});
$h_sr_ObjectRef.prototype = $c_sr_ObjectRef.prototype;
$c_sr_ObjectRef.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeString$().valueOf__O__T(this.elem$1)
});
$c_sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_ObjectRef = new $TypeData().initClass({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_ObjectRef.prototype.$classData = $d_sr_ObjectRef;
/** @constructor */
var $c_Ljapgolly_scalajs_react_CompStateAccess$SS$ = (function() {
  $c_Ljapgolly_scalajs_react_CompStateAccess$HK.call(this)
});
$c_Ljapgolly_scalajs_react_CompStateAccess$SS$.prototype = new $h_Ljapgolly_scalajs_react_CompStateAccess$HK();
$c_Ljapgolly_scalajs_react_CompStateAccess$SS$.prototype.constructor = $c_Ljapgolly_scalajs_react_CompStateAccess$SS$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_CompStateAccess$SS$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_CompStateAccess$SS$.prototype = $c_Ljapgolly_scalajs_react_CompStateAccess$SS$.prototype;
$c_Ljapgolly_scalajs_react_CompStateAccess$SS$.prototype.setState__Ljapgolly_scalajs_react_ComponentScope$undSS__O__sjs_js_UndefOr__V = (function(c, s, cb) {
  var jsx$2 = $m_Ljapgolly_scalajs_react_package$().WrapObj__O__Ljapgolly_scalajs_react_package$WrapObj(s);
  if ((cb === (void 0))) {
    var jsx$1 = (void 0)
  } else {
    var f = $as_F0(cb);
    var value = (function(f$1) {
      return (function() {
        return f$1.apply__O()
      })
    })(f);
    var jsx$1 = value
  };
  c["setState"](jsx$2, jsx$1)
});
$c_Ljapgolly_scalajs_react_CompStateAccess$SS$.prototype.state__Ljapgolly_scalajs_react_ComponentScope$undSS__O = (function(c) {
  return c["state"]["v"]
});
var $d_Ljapgolly_scalajs_react_CompStateAccess$SS$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CompStateAccess$SS$: 0
}, false, "japgolly.scalajs.react.CompStateAccess$SS$", {
  Ljapgolly_scalajs_react_CompStateAccess$SS$: 1,
  Ljapgolly_scalajs_react_CompStateAccess$HK: 1,
  Ljapgolly_scalajs_react_CompStateAccess: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CompStateAccess$SS$.prototype.$classData = $d_Ljapgolly_scalajs_react_CompStateAccess$SS$;
var $n_Ljapgolly_scalajs_react_CompStateAccess$SS$ = (void 0);
var $m_Ljapgolly_scalajs_react_CompStateAccess$SS$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_CompStateAccess$SS$)) {
    $n_Ljapgolly_scalajs_react_CompStateAccess$SS$ = new $c_Ljapgolly_scalajs_react_CompStateAccess$SS$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CompStateAccess$SS$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor = (function() {
  $c_O.call(this)
});
$c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor.prototype = $c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor.prototype.withKey__sjs_js_Any__Ljapgolly_scalajs_react_ReactComponentC$BaseCtor = (function(k) {
  return this.set__sjs_js_UndefOr__sjs_js_UndefOr__Ljapgolly_scalajs_react_ReactComponentC$BaseCtor(k, this.ref__sjs_js_UndefOr())
});
$c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor.prototype.mkProps__O__Ljapgolly_scalajs_react_package$WrapObj = (function(props) {
  var j = $m_Ljapgolly_scalajs_react_package$().WrapObj__O__Ljapgolly_scalajs_react_package$WrapObj(props);
  var $$this = this.key__sjs_js_UndefOr();
  if (($$this !== (void 0))) {
    j["key"] = $$this
  };
  var $$this$1 = this.ref__sjs_js_UndefOr();
  if (($$this$1 !== (void 0))) {
    var r = $as_T($$this$1);
    j["ref"] = ($m_Ljapgolly_scalajs_react_package$(), r)
  };
  return j
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Implicits$ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Implicits.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_Implicits$.prototype = new $h_Ljapgolly_scalajs_react_vdom_Implicits();
$c_Ljapgolly_scalajs_react_vdom_Implicits$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Implicits$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Implicits$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Implicits$.prototype = $c_Ljapgolly_scalajs_react_vdom_Implicits$.prototype;
var $d_Ljapgolly_scalajs_react_vdom_Implicits$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Implicits$: 0
}, false, "japgolly.scalajs.react.vdom.Implicits$", {
  Ljapgolly_scalajs_react_vdom_Implicits$: 1,
  Ljapgolly_scalajs_react_vdom_Implicits: 1,
  Ljapgolly_scalajs_react_vdom_LowPri: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Implicits$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Implicits$;
var $n_Ljapgolly_scalajs_react_vdom_Implicits$ = (void 0);
var $m_Ljapgolly_scalajs_react_vdom_Implicits$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Implicits$)) {
    $n_Ljapgolly_scalajs_react_vdom_Implicits$ = new $c_Ljapgolly_scalajs_react_vdom_Implicits$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Implicits$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_package$Base = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Implicits.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_package$Base.prototype = new $h_Ljapgolly_scalajs_react_vdom_Implicits();
$c_Ljapgolly_scalajs_react_vdom_package$Base.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_package$Base;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_package$Base = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_package$Base.prototype = $c_Ljapgolly_scalajs_react_vdom_package$Base.prototype;
/** @constructor */
var $c_Ljava_io_OutputStream = (function() {
  $c_O.call(this)
});
$c_Ljava_io_OutputStream.prototype = new $h_O();
$c_Ljava_io_OutputStream.prototype.constructor = $c_Ljava_io_OutputStream;
/** @constructor */
var $h_Ljava_io_OutputStream = (function() {
  /*<skip>*/
});
$h_Ljava_io_OutputStream.prototype = $c_Ljava_io_OutputStream.prototype;
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return $isByte(x)
}));
var $isArrayOf_jl_Double = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
});
var $asArrayOf_jl_Double = (function(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
});
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ((typeof x) === "number")
}));
/** @constructor */
var $c_jl_Error = (function() {
  $c_jl_Throwable.call(this)
});
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
var $h_jl_Error = (function() {
  /*<skip>*/
});
$h_jl_Error.prototype = $c_jl_Error.prototype;
$c_jl_Error.prototype.init___T = (function(s) {
  $c_jl_Error.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $is_jl_Error = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Error)))
});
var $as_jl_Error = (function(obj) {
  return (($is_jl_Error(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Error"))
});
var $isArrayOf_jl_Error = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Error)))
});
var $asArrayOf_jl_Error = (function(obj, depth) {
  return (($isArrayOf_jl_Error(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Error;", depth))
});
/** @constructor */
var $c_jl_Exception = (function() {
  $c_jl_Throwable.call(this)
});
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
var $h_jl_Exception = (function() {
  /*<skip>*/
});
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
$c_jl_Exception.prototype.init___ = (function() {
  $c_jl_Exception.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_jl_Exception.prototype.init___T = (function(s) {
  $c_jl_Exception.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return $isFloat(x)
}));
var $isArrayOf_jl_Integer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Integer)))
});
var $asArrayOf_jl_Integer = (function(obj, depth) {
  return (($isArrayOf_jl_Integer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Integer;", depth))
});
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return $isInt(x)
}));
var $isArrayOf_jl_Long = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
});
var $asArrayOf_jl_Long = (function(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
});
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
var $c_ju_regex_Pattern = (function() {
  $c_O.call(this);
  this.pattern0$1 = null;
  this.flags0$1 = 0;
  this.x$1$1 = null;
  this.jspattern$1 = null;
  this.flags1$1 = 0;
  this.jsflags$1 = null
});
$c_ju_regex_Pattern.prototype = new $h_O();
$c_ju_regex_Pattern.prototype.constructor = $c_ju_regex_Pattern;
/** @constructor */
var $h_ju_regex_Pattern = (function() {
  /*<skip>*/
});
$h_ju_regex_Pattern.prototype = $c_ju_regex_Pattern.prototype;
$c_ju_regex_Pattern.prototype.toString__T = (function() {
  return this.pattern0$1
});
$c_ju_regex_Pattern.prototype.init___T__I = (function(pattern0, flags0) {
  this.pattern0$1 = pattern0;
  this.flags0$1 = flags0;
  if (((16 & flags0) !== 0)) {
    var x1 = new $c_T2().init___O__O($m_ju_regex_Pattern$().quote__T__T(pattern0), flags0)
  } else {
    var this$1 = $m_ju_regex_Pattern$();
    var m = this$1.java$util$regex$Pattern$$splitHackPat$1["exec"](pattern0);
    if ((m !== null)) {
      var $$this = m[1];
      if (($$this === (void 0))) {
        var jsx$1;
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$1 = $$this
      };
      var this$5 = new $c_s_Some().init___O(new $c_T2().init___O__O(this$1.quote__T__T($as_T(jsx$1)), flags0))
    } else {
      var this$5 = $m_s_None$()
    };
    if (this$5.isEmpty__Z()) {
      var this$6 = $m_ju_regex_Pattern$();
      var pat = this.pattern0$1;
      var flags0$1 = this.flags0$1;
      var m$1 = this$6.java$util$regex$Pattern$$flagHackPat$1["exec"](pat);
      if ((m$1 !== null)) {
        var $$this$1 = m$1[0];
        if (($$this$1 === (void 0))) {
          var jsx$2;
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        } else {
          var jsx$2 = $$this$1
        };
        var thiz = $as_T(jsx$2);
        var beginIndex = $uI(thiz["length"]);
        var newPat = $as_T(pat["substring"](beginIndex));
        var $$this$2 = m$1[1];
        if (($$this$2 === (void 0))) {
          var flags1 = flags0$1
        } else {
          var chars = $as_T($$this$2);
          var this$17 = new $c_sci_StringOps().init___T(chars);
          var start = 0;
          var $$this$3 = this$17.repr$1;
          var end = $uI($$this$3["length"]);
          var z = flags0$1;
          x: {
            var jsx$3;
            _foldl: while (true) {
              if ((start === end)) {
                var jsx$3 = z;
                break x
              } else {
                var temp$start = ((1 + start) | 0);
                var arg1 = z;
                var arg2 = this$17.apply__I__O(start);
                var f = $uI(arg1);
                if ((arg2 === null)) {
                  var c = 0
                } else {
                  var this$21 = $as_jl_Character(arg2);
                  var c = this$21.value$1
                };
                var temp$z = (f | this$6.java$util$regex$Pattern$$charToFlag__C__I(c));
                start = temp$start;
                z = temp$z;
                continue _foldl
              }
            }
          };
          var flags1 = $uI(jsx$3)
        };
        var $$this$4 = m$1[2];
        if (($$this$4 === (void 0))) {
          var flags2 = flags1
        } else {
          var chars$3 = $as_T($$this$4);
          var this$26 = new $c_sci_StringOps().init___T(chars$3);
          var start$1 = 0;
          var $$this$5 = this$26.repr$1;
          var end$1 = $uI($$this$5["length"]);
          var z$1 = flags1;
          x$1: {
            var jsx$4;
            _foldl$1: while (true) {
              if ((start$1 === end$1)) {
                var jsx$4 = z$1;
                break x$1
              } else {
                var temp$start$1 = ((1 + start$1) | 0);
                var arg1$1 = z$1;
                var arg2$1 = this$26.apply__I__O(start$1);
                var f$1 = $uI(arg1$1);
                if ((arg2$1 === null)) {
                  var c$1 = 0
                } else {
                  var this$30 = $as_jl_Character(arg2$1);
                  var c$1 = this$30.value$1
                };
                var temp$z$1 = (f$1 & (~this$6.java$util$regex$Pattern$$charToFlag__C__I(c$1)));
                start$1 = temp$start$1;
                z$1 = temp$z$1;
                continue _foldl$1
              }
            }
          };
          var flags2 = $uI(jsx$4)
        };
        var this$31 = new $c_s_Some().init___O(new $c_T2().init___O__O(newPat, flags2))
      } else {
        var this$31 = $m_s_None$()
      }
    } else {
      var this$31 = this$5
    };
    var x1 = $as_T2((this$31.isEmpty__Z() ? new $c_T2().init___O__O(this.pattern0$1, this.flags0$1) : this$31.get__O()))
  };
  if ((x1 !== null)) {
    var jspattern = $as_T(x1.$$und1$f);
    var flags1$1 = $uI(x1.$$und2$f);
    var jsx$5 = new $c_T2().init___O__O(jspattern, flags1$1)
  } else {
    var jsx$5;
    throw new $c_s_MatchError().init___O(x1)
  };
  this.x$1$1 = jsx$5;
  this.jspattern$1 = $as_T(this.x$1$1.$$und1$f);
  var this$32 = this.x$1$1;
  this.flags1$1 = $uI(this$32.$$und2$f);
  var f$2 = "g";
  if (((2 & this.flags1$1) !== 0)) {
    f$2 = (f$2 + "i")
  };
  if (((8 & this.flags1$1) !== 0)) {
    f$2 = (f$2 + "m")
  };
  this.jsflags$1 = f$2;
  return this
});
var $d_ju_regex_Pattern = new $TypeData().initClass({
  ju_regex_Pattern: 0
}, false, "java.util.regex.Pattern", {
  ju_regex_Pattern: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern.prototype.$classData = $d_ju_regex_Pattern;
/** @constructor */
var $c_ju_regex_Pattern$ = (function() {
  $c_O.call(this);
  this.UNIX$undLINES$1 = 0;
  this.CASE$undINSENSITIVE$1 = 0;
  this.COMMENTS$1 = 0;
  this.MULTILINE$1 = 0;
  this.LITERAL$1 = 0;
  this.DOTALL$1 = 0;
  this.UNICODE$undCASE$1 = 0;
  this.CANON$undEQ$1 = 0;
  this.UNICODE$undCHARACTER$undCLASS$1 = 0;
  this.java$util$regex$Pattern$$splitHackPat$1 = null;
  this.java$util$regex$Pattern$$flagHackPat$1 = null
});
$c_ju_regex_Pattern$.prototype = new $h_O();
$c_ju_regex_Pattern$.prototype.constructor = $c_ju_regex_Pattern$;
/** @constructor */
var $h_ju_regex_Pattern$ = (function() {
  /*<skip>*/
});
$h_ju_regex_Pattern$.prototype = $c_ju_regex_Pattern$.prototype;
$c_ju_regex_Pattern$.prototype.init___ = (function() {
  $n_ju_regex_Pattern$ = this;
  this.java$util$regex$Pattern$$splitHackPat$1 = new $g["RegExp"]("^\\\\Q(.|\\n|\\r)\\\\E$");
  this.java$util$regex$Pattern$$flagHackPat$1 = new $g["RegExp"]("^\\(\\?([idmsuxU]*)(?:-([idmsuxU]*))?\\)");
  return this
});
$c_ju_regex_Pattern$.prototype.quote__T__T = (function(s) {
  var result = "";
  var i = 0;
  while ((i < $uI(s["length"]))) {
    var index = i;
    var c = (65535 & $uI(s["charCodeAt"](index)));
    var jsx$2 = result;
    switch (c) {
      case 92:
      case 46:
      case 40:
      case 41:
      case 91:
      case 93:
      case 123:
      case 125:
      case 124:
      case 63:
      case 42:
      case 43:
      case 94:
      case 36: {
        var jsx$1 = ("\\" + new $c_jl_Character().init___C(c));
        break
      }
      default: {
        var jsx$1 = new $c_jl_Character().init___C(c)
      }
    };
    result = (("" + jsx$2) + jsx$1);
    i = ((1 + i) | 0)
  };
  return result
});
$c_ju_regex_Pattern$.prototype.java$util$regex$Pattern$$charToFlag__C__I = (function(c) {
  switch (c) {
    case 105: {
      return 2;
      break
    }
    case 100: {
      return 1;
      break
    }
    case 109: {
      return 8;
      break
    }
    case 115: {
      return 32;
      break
    }
    case 117: {
      return 64;
      break
    }
    case 120: {
      return 4;
      break
    }
    case 85: {
      return 256;
      break
    }
    default: {
      $m_s_sys_package$().error__T__sr_Nothing$("bad in-pattern flag")
    }
  }
});
var $d_ju_regex_Pattern$ = new $TypeData().initClass({
  ju_regex_Pattern$: 0
}, false, "java.util.regex.Pattern$", {
  ju_regex_Pattern$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern$.prototype.$classData = $d_ju_regex_Pattern$;
var $n_ju_regex_Pattern$ = (void 0);
var $m_ju_regex_Pattern$ = (function() {
  if ((!$n_ju_regex_Pattern$)) {
    $n_ju_regex_Pattern$ = new $c_ju_regex_Pattern$().init___()
  };
  return $n_ju_regex_Pattern$
});
/** @constructor */
var $c_s_Console$ = (function() {
  $c_s_DeprecatedConsole.call(this);
  this.outVar$2 = null;
  this.errVar$2 = null;
  this.inVar$2 = null
});
$c_s_Console$.prototype = new $h_s_DeprecatedConsole();
$c_s_Console$.prototype.constructor = $c_s_Console$;
/** @constructor */
var $h_s_Console$ = (function() {
  /*<skip>*/
});
$h_s_Console$.prototype = $c_s_Console$.prototype;
$c_s_Console$.prototype.init___ = (function() {
  $n_s_Console$ = this;
  this.outVar$2 = new $c_s_util_DynamicVariable().init___O($m_jl_System$().out$1);
  this.errVar$2 = new $c_s_util_DynamicVariable().init___O($m_jl_System$().err$1);
  this.inVar$2 = new $c_s_util_DynamicVariable().init___O(null);
  return this
});
var $d_s_Console$ = new $TypeData().initClass({
  s_Console$: 0
}, false, "scala.Console$", {
  s_Console$: 1,
  s_DeprecatedConsole: 1,
  O: 1,
  s_io_AnsiColor: 1
});
$c_s_Console$.prototype.$classData = $d_s_Console$;
var $n_s_Console$ = (void 0);
var $m_s_Console$ = (function() {
  if ((!$n_s_Console$)) {
    $n_s_Console$ = new $c_s_Console$().init___()
  };
  return $n_s_Console$
});
/** @constructor */
var $c_s_Predef$ = (function() {
  $c_s_LowPriorityImplicits.call(this);
  this.Map$2 = null;
  this.Set$2 = null;
  this.ClassManifest$2 = null;
  this.Manifest$2 = null;
  this.NoManifest$2 = null;
  this.StringCanBuildFrom$2 = null;
  this.singleton$und$less$colon$less$2 = null;
  this.scala$Predef$$singleton$und$eq$colon$eq$f = null
});
$c_s_Predef$.prototype = new $h_s_LowPriorityImplicits();
$c_s_Predef$.prototype.constructor = $c_s_Predef$;
/** @constructor */
var $h_s_Predef$ = (function() {
  /*<skip>*/
});
$h_s_Predef$.prototype = $c_s_Predef$.prototype;
$c_s_Predef$.prototype.init___ = (function() {
  $n_s_Predef$ = this;
  $m_s_package$();
  $m_sci_List$();
  this.Map$2 = $m_sci_Map$();
  this.Set$2 = $m_sci_Set$();
  this.ClassManifest$2 = $m_s_reflect_package$().ClassManifest$1;
  this.Manifest$2 = $m_s_reflect_package$().Manifest$1;
  this.NoManifest$2 = $m_s_reflect_NoManifest$();
  this.StringCanBuildFrom$2 = new $c_s_Predef$$anon$3().init___();
  this.singleton$und$less$colon$less$2 = new $c_s_Predef$$anon$1().init___();
  this.scala$Predef$$singleton$und$eq$colon$eq$f = new $c_s_Predef$$anon$2().init___();
  return this
});
$c_s_Predef$.prototype.assert__Z__V = (function(assertion) {
  if ((!assertion)) {
    throw new $c_jl_AssertionError().init___O("assertion failed")
  }
});
$c_s_Predef$.prototype.require__Z__V = (function(requirement) {
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed")
  }
});
var $d_s_Predef$ = new $TypeData().initClass({
  s_Predef$: 0
}, false, "scala.Predef$", {
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  O: 1,
  s_DeprecatedPredef: 1
});
$c_s_Predef$.prototype.$classData = $d_s_Predef$;
var $n_s_Predef$ = (void 0);
var $m_s_Predef$ = (function() {
  if ((!$n_s_Predef$)) {
    $n_s_Predef$ = new $c_s_Predef$().init___()
  };
  return $n_s_Predef$
});
/** @constructor */
var $c_s_StringContext$ = (function() {
  $c_O.call(this)
});
$c_s_StringContext$.prototype = new $h_O();
$c_s_StringContext$.prototype.constructor = $c_s_StringContext$;
/** @constructor */
var $h_s_StringContext$ = (function() {
  /*<skip>*/
});
$h_s_StringContext$.prototype = $c_s_StringContext$.prototype;
$c_s_StringContext$.prototype.treatEscapes0__p1__T__Z__T = (function(str, strict) {
  var len = $uI(str["length"]);
  var x1 = $m_sjsr_RuntimeString$().indexOf__T__I__I(str, 92);
  switch (x1) {
    case (-1): {
      return str;
      break
    }
    default: {
      return this.replace$1__p1__I__T__Z__I__T(x1, str, strict, len)
    }
  }
});
$c_s_StringContext$.prototype.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T = (function(i, next, str$1, strict$1, len$1, b$1) {
  _loop: while (true) {
    if ((next >= 0)) {
      if ((next > i)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, next)
      };
      var idx = ((1 + next) | 0);
      if ((idx >= len$1)) {
        throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
      };
      var index = idx;
      var x1 = (65535 & $uI(str$1["charCodeAt"](index)));
      switch (x1) {
        case 98: {
          var c = 8;
          break
        }
        case 116: {
          var c = 9;
          break
        }
        case 110: {
          var c = 10;
          break
        }
        case 102: {
          var c = 12;
          break
        }
        case 114: {
          var c = 13;
          break
        }
        case 34: {
          var c = 34;
          break
        }
        case 39: {
          var c = 39;
          break
        }
        case 92: {
          var c = 92;
          break
        }
        default: {
          if (((x1 >= 48) && (x1 <= 55))) {
            if (strict$1) {
              throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
            };
            var index$1 = idx;
            var leadch = (65535 & $uI(str$1["charCodeAt"](index$1)));
            var oct = (((-48) + leadch) | 0);
            idx = ((1 + idx) | 0);
            if ((idx < len$1)) {
              var index$2 = idx;
              var jsx$2 = ((65535 & $uI(str$1["charCodeAt"](index$2))) >= 48)
            } else {
              var jsx$2 = false
            };
            if (jsx$2) {
              var index$3 = idx;
              var jsx$1 = ((65535 & $uI(str$1["charCodeAt"](index$3))) <= 55)
            } else {
              var jsx$1 = false
            };
            if (jsx$1) {
              var jsx$3 = oct;
              var index$4 = idx;
              oct = (((-48) + (($imul(8, jsx$3) + (65535 & $uI(str$1["charCodeAt"](index$4)))) | 0)) | 0);
              idx = ((1 + idx) | 0);
              if (((idx < len$1) && (leadch <= 51))) {
                var index$5 = idx;
                var jsx$5 = ((65535 & $uI(str$1["charCodeAt"](index$5))) >= 48)
              } else {
                var jsx$5 = false
              };
              if (jsx$5) {
                var index$6 = idx;
                var jsx$4 = ((65535 & $uI(str$1["charCodeAt"](index$6))) <= 55)
              } else {
                var jsx$4 = false
              };
              if (jsx$4) {
                var jsx$6 = oct;
                var index$7 = idx;
                oct = (((-48) + (($imul(8, jsx$6) + (65535 & $uI(str$1["charCodeAt"](index$7)))) | 0)) | 0);
                idx = ((1 + idx) | 0)
              }
            };
            idx = (((-1) + idx) | 0);
            var c = (65535 & oct)
          } else {
            var c;
            throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
          }
        }
      };
      idx = ((1 + idx) | 0);
      b$1.append__C__jl_StringBuilder(c);
      var temp$i = idx;
      var temp$next = $m_sjsr_RuntimeString$().indexOf__T__I__I__I(str$1, 92, idx);
      i = temp$i;
      next = temp$next;
      continue _loop
    } else {
      if ((i < len$1)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, len$1)
      };
      return b$1.content$1
    }
  }
});
$c_s_StringContext$.prototype.replace$1__p1__I__T__Z__I__T = (function(first, str$1, strict$1, len$1) {
  var b = new $c_jl_StringBuilder().init___();
  return this.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T(0, first, str$1, strict$1, len$1, b)
});
var $d_s_StringContext$ = new $TypeData().initClass({
  s_StringContext$: 0
}, false, "scala.StringContext$", {
  s_StringContext$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$.prototype.$classData = $d_s_StringContext$;
var $n_s_StringContext$ = (void 0);
var $m_s_StringContext$ = (function() {
  if ((!$n_s_StringContext$)) {
    $n_s_StringContext$ = new $c_s_StringContext$().init___()
  };
  return $n_s_StringContext$
});
/** @constructor */
var $c_s_concurrent_impl_CallbackRunnable = (function() {
  $c_O.call(this);
  this.executor$1 = null;
  this.onComplete$1 = null;
  this.value$1 = null
});
$c_s_concurrent_impl_CallbackRunnable.prototype = new $h_O();
$c_s_concurrent_impl_CallbackRunnable.prototype.constructor = $c_s_concurrent_impl_CallbackRunnable;
/** @constructor */
var $h_s_concurrent_impl_CallbackRunnable = (function() {
  /*<skip>*/
});
$h_s_concurrent_impl_CallbackRunnable.prototype = $c_s_concurrent_impl_CallbackRunnable.prototype;
$c_s_concurrent_impl_CallbackRunnable.prototype.run__V = (function() {
  $m_s_Predef$().require__Z__V((this.value$1 !== null));
  try {
    this.onComplete$1.apply__O__O(this.value$1)
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      matchEnd8: {
        var o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
        if ((!o11.isEmpty__Z())) {
          var e$3 = $as_jl_Throwable(o11.get__O());
          this.executor$1.reportFailure__jl_Throwable__V(e$3);
          break matchEnd8
        };
        throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
$c_s_concurrent_impl_CallbackRunnable.prototype.init___s_concurrent_ExecutionContext__F1 = (function(executor, onComplete) {
  this.executor$1 = executor;
  this.onComplete$1 = onComplete;
  this.value$1 = null;
  return this
});
$c_s_concurrent_impl_CallbackRunnable.prototype.executeWithValue__s_util_Try__V = (function(v) {
  $m_s_Predef$().require__Z__V((this.value$1 === null));
  this.value$1 = v;
  try {
    this.executor$1.execute__jl_Runnable__V(this)
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      matchEnd8: {
        var o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
        if ((!o11.isEmpty__Z())) {
          var t = $as_jl_Throwable(o11.get__O());
          this.executor$1.reportFailure__jl_Throwable__V(t);
          break matchEnd8
        };
        throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
var $is_s_concurrent_impl_CallbackRunnable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_impl_CallbackRunnable)))
});
var $as_s_concurrent_impl_CallbackRunnable = (function(obj) {
  return (($is_s_concurrent_impl_CallbackRunnable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.concurrent.impl.CallbackRunnable"))
});
var $isArrayOf_s_concurrent_impl_CallbackRunnable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_impl_CallbackRunnable)))
});
var $asArrayOf_s_concurrent_impl_CallbackRunnable = (function(obj, depth) {
  return (($isArrayOf_s_concurrent_impl_CallbackRunnable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.concurrent.impl.CallbackRunnable;", depth))
});
var $d_s_concurrent_impl_CallbackRunnable = new $TypeData().initClass({
  s_concurrent_impl_CallbackRunnable: 0
}, false, "scala.concurrent.impl.CallbackRunnable", {
  s_concurrent_impl_CallbackRunnable: 1,
  O: 1,
  jl_Runnable: 1,
  s_concurrent_OnCompleteRunnable: 1
});
$c_s_concurrent_impl_CallbackRunnable.prototype.$classData = $d_s_concurrent_impl_CallbackRunnable;
/** @constructor */
var $c_s_math_Fractional$ = (function() {
  $c_O.call(this)
});
$c_s_math_Fractional$.prototype = new $h_O();
$c_s_math_Fractional$.prototype.constructor = $c_s_math_Fractional$;
/** @constructor */
var $h_s_math_Fractional$ = (function() {
  /*<skip>*/
});
$h_s_math_Fractional$.prototype = $c_s_math_Fractional$.prototype;
var $d_s_math_Fractional$ = new $TypeData().initClass({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Fractional$.prototype.$classData = $d_s_math_Fractional$;
var $n_s_math_Fractional$ = (void 0);
var $m_s_math_Fractional$ = (function() {
  if ((!$n_s_math_Fractional$)) {
    $n_s_math_Fractional$ = new $c_s_math_Fractional$().init___()
  };
  return $n_s_math_Fractional$
});
/** @constructor */
var $c_s_math_Integral$ = (function() {
  $c_O.call(this)
});
$c_s_math_Integral$.prototype = new $h_O();
$c_s_math_Integral$.prototype.constructor = $c_s_math_Integral$;
/** @constructor */
var $h_s_math_Integral$ = (function() {
  /*<skip>*/
});
$h_s_math_Integral$.prototype = $c_s_math_Integral$.prototype;
var $d_s_math_Integral$ = new $TypeData().initClass({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Integral$.prototype.$classData = $d_s_math_Integral$;
var $n_s_math_Integral$ = (void 0);
var $m_s_math_Integral$ = (function() {
  if ((!$n_s_math_Integral$)) {
    $n_s_math_Integral$ = new $c_s_math_Integral$().init___()
  };
  return $n_s_math_Integral$
});
/** @constructor */
var $c_s_math_Numeric$ = (function() {
  $c_O.call(this)
});
$c_s_math_Numeric$.prototype = new $h_O();
$c_s_math_Numeric$.prototype.constructor = $c_s_math_Numeric$;
/** @constructor */
var $h_s_math_Numeric$ = (function() {
  /*<skip>*/
});
$h_s_math_Numeric$.prototype = $c_s_math_Numeric$.prototype;
var $d_s_math_Numeric$ = new $TypeData().initClass({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Numeric$.prototype.$classData = $d_s_math_Numeric$;
var $n_s_math_Numeric$ = (void 0);
var $m_s_math_Numeric$ = (function() {
  if ((!$n_s_math_Numeric$)) {
    $n_s_math_Numeric$ = new $c_s_math_Numeric$().init___()
  };
  return $n_s_math_Numeric$
});
/** @constructor */
var $c_s_util_DynamicVariable$$anon$1 = (function() {
  $c_jl_InheritableThreadLocal.call(this);
  this.$$outer$3 = null
});
$c_s_util_DynamicVariable$$anon$1.prototype = new $h_jl_InheritableThreadLocal();
$c_s_util_DynamicVariable$$anon$1.prototype.constructor = $c_s_util_DynamicVariable$$anon$1;
/** @constructor */
var $h_s_util_DynamicVariable$$anon$1 = (function() {
  /*<skip>*/
});
$h_s_util_DynamicVariable$$anon$1.prototype = $c_s_util_DynamicVariable$$anon$1.prototype;
$c_s_util_DynamicVariable$$anon$1.prototype.init___s_util_DynamicVariable = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$3 = $$outer
  };
  $c_jl_InheritableThreadLocal.prototype.init___.call(this);
  return this
});
$c_s_util_DynamicVariable$$anon$1.prototype.initialValue__O = (function() {
  return this.$$outer$3.scala$util$DynamicVariable$$init$f
});
var $d_s_util_DynamicVariable$$anon$1 = new $TypeData().initClass({
  s_util_DynamicVariable$$anon$1: 0
}, false, "scala.util.DynamicVariable$$anon$1", {
  s_util_DynamicVariable$$anon$1: 1,
  jl_InheritableThreadLocal: 1,
  jl_ThreadLocal: 1,
  O: 1
});
$c_s_util_DynamicVariable$$anon$1.prototype.$classData = $d_s_util_DynamicVariable$$anon$1;
/** @constructor */
var $c_s_util_Left$ = (function() {
  $c_O.call(this)
});
$c_s_util_Left$.prototype = new $h_O();
$c_s_util_Left$.prototype.constructor = $c_s_util_Left$;
/** @constructor */
var $h_s_util_Left$ = (function() {
  /*<skip>*/
});
$h_s_util_Left$.prototype = $c_s_util_Left$.prototype;
$c_s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
var $d_s_util_Left$ = new $TypeData().initClass({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left$.prototype.$classData = $d_s_util_Left$;
var $n_s_util_Left$ = (void 0);
var $m_s_util_Left$ = (function() {
  if ((!$n_s_util_Left$)) {
    $n_s_util_Left$ = new $c_s_util_Left$().init___()
  };
  return $n_s_util_Left$
});
/** @constructor */
var $c_s_util_Right$ = (function() {
  $c_O.call(this)
});
$c_s_util_Right$.prototype = new $h_O();
$c_s_util_Right$.prototype.constructor = $c_s_util_Right$;
/** @constructor */
var $h_s_util_Right$ = (function() {
  /*<skip>*/
});
$h_s_util_Right$.prototype = $c_s_util_Right$.prototype;
$c_s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
var $d_s_util_Right$ = new $TypeData().initClass({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right$.prototype.$classData = $d_s_util_Right$;
var $n_s_util_Right$ = (void 0);
var $m_s_util_Right$ = (function() {
  if ((!$n_s_util_Right$)) {
    $n_s_util_Right$ = new $c_s_util_Right$().init___()
  };
  return $n_s_util_Right$
});
/** @constructor */
var $c_s_util_control_NoStackTrace$ = (function() {
  $c_O.call(this);
  this.$$undnoSuppression$1 = false
});
$c_s_util_control_NoStackTrace$.prototype = new $h_O();
$c_s_util_control_NoStackTrace$.prototype.constructor = $c_s_util_control_NoStackTrace$;
/** @constructor */
var $h_s_util_control_NoStackTrace$ = (function() {
  /*<skip>*/
});
$h_s_util_control_NoStackTrace$.prototype = $c_s_util_control_NoStackTrace$.prototype;
$c_s_util_control_NoStackTrace$.prototype.init___ = (function() {
  $n_s_util_control_NoStackTrace$ = this;
  this.$$undnoSuppression$1 = false;
  return this
});
var $d_s_util_control_NoStackTrace$ = new $TypeData().initClass({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_control_NoStackTrace$.prototype.$classData = $d_s_util_control_NoStackTrace$;
var $n_s_util_control_NoStackTrace$ = (void 0);
var $m_s_util_control_NoStackTrace$ = (function() {
  if ((!$n_s_util_control_NoStackTrace$)) {
    $n_s_util_control_NoStackTrace$ = new $c_s_util_control_NoStackTrace$().init___()
  };
  return $n_s_util_control_NoStackTrace$
});
/** @constructor */
var $c_s_util_matching_Regex = (function() {
  $c_O.call(this);
  this.pattern$1 = null;
  this.scala$util$matching$Regex$$groupNames$f = null
});
$c_s_util_matching_Regex.prototype = new $h_O();
$c_s_util_matching_Regex.prototype.constructor = $c_s_util_matching_Regex;
/** @constructor */
var $h_s_util_matching_Regex = (function() {
  /*<skip>*/
});
$h_s_util_matching_Regex.prototype = $c_s_util_matching_Regex.prototype;
$c_s_util_matching_Regex.prototype.init___T__sc_Seq = (function(regex, groupNames) {
  $c_s_util_matching_Regex.prototype.init___ju_regex_Pattern__sc_Seq.call(this, ($m_ju_regex_Pattern$(), new $c_ju_regex_Pattern().init___T__I(regex, 0)), groupNames);
  return this
});
$c_s_util_matching_Regex.prototype.init___ju_regex_Pattern__sc_Seq = (function(pattern, groupNames) {
  this.pattern$1 = pattern;
  this.scala$util$matching$Regex$$groupNames$f = groupNames;
  return this
});
$c_s_util_matching_Regex.prototype.toString__T = (function() {
  return this.pattern$1.pattern0$1
});
var $d_s_util_matching_Regex = new $TypeData().initClass({
  s_util_matching_Regex: 0
}, false, "scala.util.matching.Regex", {
  s_util_matching_Regex: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_matching_Regex.prototype.$classData = $d_s_util_matching_Regex;
/** @constructor */
var $c_sc_IndexedSeq$$anon$1 = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
});
$c_sc_IndexedSeq$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sc_IndexedSeq$$anon$1.prototype.constructor = $c_sc_IndexedSeq$$anon$1;
/** @constructor */
var $h_sc_IndexedSeq$$anon$1 = (function() {
  /*<skip>*/
});
$h_sc_IndexedSeq$$anon$1.prototype = $c_sc_IndexedSeq$$anon$1.prototype;
$c_sc_IndexedSeq$$anon$1.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sc_IndexedSeq$());
  return this
});
$c_sc_IndexedSeq$$anon$1.prototype.apply__scm_Builder = (function() {
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$$anon$1 = new $TypeData().initClass({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sc_IndexedSeq$$anon$1.prototype.$classData = $d_sc_IndexedSeq$$anon$1;
/** @constructor */
var $c_scg_GenSeqFactory = (function() {
  $c_scg_GenTraversableFactory.call(this)
});
$c_scg_GenSeqFactory.prototype = new $h_scg_GenTraversableFactory();
$c_scg_GenSeqFactory.prototype.constructor = $c_scg_GenSeqFactory;
/** @constructor */
var $h_scg_GenSeqFactory = (function() {
  /*<skip>*/
});
$h_scg_GenSeqFactory.prototype = $c_scg_GenSeqFactory.prototype;
/** @constructor */
var $c_scg_GenTraversableFactory$$anon$1 = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this);
  this.$$outer$2 = null
});
$c_scg_GenTraversableFactory$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_scg_GenTraversableFactory$$anon$1.prototype.constructor = $c_scg_GenTraversableFactory$$anon$1;
/** @constructor */
var $h_scg_GenTraversableFactory$$anon$1 = (function() {
  /*<skip>*/
});
$h_scg_GenTraversableFactory$$anon$1.prototype = $c_scg_GenTraversableFactory$$anon$1.prototype;
$c_scg_GenTraversableFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  return this.$$outer$2.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$$anon$1.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
  return this
});
var $d_scg_GenTraversableFactory$$anon$1 = new $TypeData().initClass({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenTraversableFactory$$anon$1.prototype.$classData = $d_scg_GenTraversableFactory$$anon$1;
/** @constructor */
var $c_scg_ImmutableMapFactory = (function() {
  $c_scg_MapFactory.call(this)
});
$c_scg_ImmutableMapFactory.prototype = new $h_scg_MapFactory();
$c_scg_ImmutableMapFactory.prototype.constructor = $c_scg_ImmutableMapFactory;
/** @constructor */
var $h_scg_ImmutableMapFactory = (function() {
  /*<skip>*/
});
$h_scg_ImmutableMapFactory.prototype = $c_scg_ImmutableMapFactory.prototype;
/** @constructor */
var $c_sci_$colon$colon$ = (function() {
  $c_O.call(this)
});
$c_sci_$colon$colon$.prototype = new $h_O();
$c_sci_$colon$colon$.prototype.constructor = $c_sci_$colon$colon$;
/** @constructor */
var $h_sci_$colon$colon$ = (function() {
  /*<skip>*/
});
$h_sci_$colon$colon$.prototype = $c_sci_$colon$colon$.prototype;
$c_sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
var $d_sci_$colon$colon$ = new $TypeData().initClass({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon$.prototype.$classData = $d_sci_$colon$colon$;
var $n_sci_$colon$colon$ = (void 0);
var $m_sci_$colon$colon$ = (function() {
  if ((!$n_sci_$colon$colon$)) {
    $n_sci_$colon$colon$ = new $c_sci_$colon$colon$().init___()
  };
  return $n_sci_$colon$colon$
});
/** @constructor */
var $c_sci_Range$ = (function() {
  $c_O.call(this);
  this.MAX$undPRINT$1 = 0
});
$c_sci_Range$.prototype = new $h_O();
$c_sci_Range$.prototype.constructor = $c_sci_Range$;
/** @constructor */
var $h_sci_Range$ = (function() {
  /*<skip>*/
});
$h_sci_Range$.prototype = $c_sci_Range$.prototype;
$c_sci_Range$.prototype.init___ = (function() {
  $n_sci_Range$ = this;
  this.MAX$undPRINT$1 = 512;
  return this
});
var $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
var $n_sci_Range$ = (void 0);
var $m_sci_Range$ = (function() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
});
/** @constructor */
var $c_sci_Stream$StreamCanBuildFrom = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
});
$c_sci_Stream$StreamCanBuildFrom.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sci_Stream$StreamCanBuildFrom.prototype.constructor = $c_sci_Stream$StreamCanBuildFrom;
/** @constructor */
var $h_sci_Stream$StreamCanBuildFrom = (function() {
  /*<skip>*/
});
$h_sci_Stream$StreamCanBuildFrom.prototype = $c_sci_Stream$StreamCanBuildFrom.prototype;
$c_sci_Stream$StreamCanBuildFrom.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sci_Stream$());
  return this
});
var $d_sci_Stream$StreamCanBuildFrom = new $TypeData().initClass({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sci_Stream$StreamCanBuildFrom.prototype.$classData = $d_sci_Stream$StreamCanBuildFrom;
/** @constructor */
var $c_scm_StringBuilder$ = (function() {
  $c_O.call(this)
});
$c_scm_StringBuilder$.prototype = new $h_O();
$c_scm_StringBuilder$.prototype.constructor = $c_scm_StringBuilder$;
/** @constructor */
var $h_scm_StringBuilder$ = (function() {
  /*<skip>*/
});
$h_scm_StringBuilder$.prototype = $c_scm_StringBuilder$.prototype;
var $d_scm_StringBuilder$ = new $TypeData().initClass({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder$.prototype.$classData = $d_scm_StringBuilder$;
var $n_scm_StringBuilder$ = (void 0);
var $m_scm_StringBuilder$ = (function() {
  if ((!$n_scm_StringBuilder$)) {
    $n_scm_StringBuilder$ = new $c_scm_StringBuilder$().init___()
  };
  return $n_scm_StringBuilder$
});
/** @constructor */
var $c_sjsr_AnonFunction0 = (function() {
  $c_sr_AbstractFunction0.call(this);
  this.f$2 = null
});
$c_sjsr_AnonFunction0.prototype = new $h_sr_AbstractFunction0();
$c_sjsr_AnonFunction0.prototype.constructor = $c_sjsr_AnonFunction0;
/** @constructor */
var $h_sjsr_AnonFunction0 = (function() {
  /*<skip>*/
});
$h_sjsr_AnonFunction0.prototype = $c_sjsr_AnonFunction0.prototype;
$c_sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
$c_sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction0 = new $TypeData().initClass({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
$c_sjsr_AnonFunction0.prototype.$classData = $d_sjsr_AnonFunction0;
/** @constructor */
var $c_sjsr_AnonFunction1 = (function() {
  $c_sr_AbstractFunction1.call(this);
  this.f$2 = null
});
$c_sjsr_AnonFunction1.prototype = new $h_sr_AbstractFunction1();
$c_sjsr_AnonFunction1.prototype.constructor = $c_sjsr_AnonFunction1;
/** @constructor */
var $h_sjsr_AnonFunction1 = (function() {
  /*<skip>*/
});
$h_sjsr_AnonFunction1.prototype = $c_sjsr_AnonFunction1.prototype;
$c_sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
$c_sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction1 = new $TypeData().initClass({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
$c_sjsr_AnonFunction1.prototype.$classData = $d_sjsr_AnonFunction1;
/** @constructor */
var $c_sjsr_AnonFunction2 = (function() {
  $c_sr_AbstractFunction2.call(this);
  this.f$2 = null
});
$c_sjsr_AnonFunction2.prototype = new $h_sr_AbstractFunction2();
$c_sjsr_AnonFunction2.prototype.constructor = $c_sjsr_AnonFunction2;
/** @constructor */
var $h_sjsr_AnonFunction2 = (function() {
  /*<skip>*/
});
$h_sjsr_AnonFunction2.prototype = $c_sjsr_AnonFunction2.prototype;
$c_sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
$c_sjsr_AnonFunction2.prototype.apply__O__O__O = (function(arg1, arg2) {
  return (0, this.f$2)(arg1, arg2)
});
var $d_sjsr_AnonFunction2 = new $TypeData().initClass({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
$c_sjsr_AnonFunction2.prototype.$classData = $d_sjsr_AnonFunction2;
/** @constructor */
var $c_sjsr_AnonFunction3 = (function() {
  $c_sr_AbstractFunction3.call(this);
  this.f$2 = null
});
$c_sjsr_AnonFunction3.prototype = new $h_sr_AbstractFunction3();
$c_sjsr_AnonFunction3.prototype.constructor = $c_sjsr_AnonFunction3;
/** @constructor */
var $h_sjsr_AnonFunction3 = (function() {
  /*<skip>*/
});
$h_sjsr_AnonFunction3.prototype = $c_sjsr_AnonFunction3.prototype;
$c_sjsr_AnonFunction3.prototype.init___sjs_js_Function3 = (function(f) {
  this.f$2 = f;
  return this
});
$c_sjsr_AnonFunction3.prototype.apply__O__O__O__O = (function(arg1, arg2, arg3) {
  return (0, this.f$2)(arg1, arg2, arg3)
});
var $d_sjsr_AnonFunction3 = new $TypeData().initClass({
  sjsr_AnonFunction3: 0
}, false, "scala.scalajs.runtime.AnonFunction3", {
  sjsr_AnonFunction3: 1,
  sr_AbstractFunction3: 1,
  O: 1,
  F3: 1
});
$c_sjsr_AnonFunction3.prototype.$classData = $d_sjsr_AnonFunction3;
/** @constructor */
var $c_sjsr_RuntimeLong = (function() {
  $c_jl_Number.call(this);
  this.l$2 = 0;
  this.m$2 = 0;
  this.h$2 = 0
});
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
var $h_sjsr_RuntimeLong = (function() {
  /*<skip>*/
});
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.powerOfTwo__p2__I = (function() {
  return (((((this.h$2 === 0) && (this.m$2 === 0)) && (this.l$2 !== 0)) && ((this.l$2 & (((-1) + this.l$2) | 0)) === 0)) ? $m_jl_Integer$().numberOfTrailingZeros__I__I(this.l$2) : (((((this.h$2 === 0) && (this.m$2 !== 0)) && (this.l$2 === 0)) && ((this.m$2 & (((-1) + this.m$2) | 0)) === 0)) ? ((22 + $m_jl_Integer$().numberOfTrailingZeros__I__I(this.m$2)) | 0) : (((((this.h$2 !== 0) && (this.m$2 === 0)) && (this.l$2 === 0)) && ((this.h$2 & (((-1) + this.h$2) | 0)) === 0)) ? ((44 + $m_jl_Integer$().numberOfTrailingZeros__I__I(this.h$2)) | 0) : (-1))))
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new $c_sjsr_RuntimeLong().init___I__I__I((this.l$2 | y.l$2), (this.m$2 | y.m$2), (this.h$2 | y.h$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(y) {
  return (((524288 & this.h$2) === 0) ? (((((524288 & y.h$2) !== 0) || (this.h$2 > y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 > y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 >= y.l$2))) : (!(((((524288 & y.h$2) === 0) || (this.h$2 < y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 < y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 < y.l$2)))))
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return this.toByte__B()
});
$c_sjsr_RuntimeLong.prototype.toShort__S = (function() {
  return ((this.toInt__I() << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ($is_sjsr_RuntimeLong(that)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return this.equals__sjsr_RuntimeLong__Z(x2)
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(y) {
  return y.$$greater__sjsr_RuntimeLong__Z(this)
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  var _1 = (8191 & this.l$2);
  var _2 = ((this.l$2 >> 13) | ((15 & this.m$2) << 9));
  var _3 = (8191 & (this.m$2 >> 4));
  var _4 = ((this.m$2 >> 17) | ((255 & this.h$2) << 5));
  var _5 = ((1048320 & this.h$2) >> 8);
  matchEnd3: {
    var x$1_$_$$und1$1;
    var x$1_$_$$und2$1;
    var x$1_$_$$und3$1;
    var x$1_$_$$und4$1;
    var x$1_$_$$und5$1;
    var x$1_$_$$und1$1 = _1;
    var x$1_$_$$und2$1 = _2;
    var x$1_$_$$und3$1 = _3;
    var x$1_$_$$und4$1 = _4;
    var x$1_$_$$und5$1 = _5;
    break matchEnd3
  };
  var a0$2 = $uI(x$1_$_$$und1$1);
  var a1$2 = $uI(x$1_$_$$und2$1);
  var a2$2 = $uI(x$1_$_$$und3$1);
  var a3$2 = $uI(x$1_$_$$und4$1);
  var a4$2 = $uI(x$1_$_$$und5$1);
  var _1$1 = (8191 & y.l$2);
  var _2$1 = ((y.l$2 >> 13) | ((15 & y.m$2) << 9));
  var _3$1 = (8191 & (y.m$2 >> 4));
  var _4$1 = ((y.m$2 >> 17) | ((255 & y.h$2) << 5));
  var _5$1 = ((1048320 & y.h$2) >> 8);
  matchEnd3$2: {
    var x$2_$_$$und1$1;
    var x$2_$_$$und2$1;
    var x$2_$_$$und3$1;
    var x$2_$_$$und4$1;
    var x$2_$_$$und5$1;
    var x$2_$_$$und1$1 = _1$1;
    var x$2_$_$$und2$1 = _2$1;
    var x$2_$_$$und3$1 = _3$1;
    var x$2_$_$$und4$1 = _4$1;
    var x$2_$_$$und5$1 = _5$1;
    break matchEnd3$2
  };
  var b0$2 = $uI(x$2_$_$$und1$1);
  var b1$2 = $uI(x$2_$_$$und2$1);
  var b2$2 = $uI(x$2_$_$$und3$1);
  var b3$2 = $uI(x$2_$_$$und4$1);
  var b4$2 = $uI(x$2_$_$$und5$1);
  var p0 = $imul(a0$2, b0$2);
  var p1 = $imul(a1$2, b0$2);
  var p2 = $imul(a2$2, b0$2);
  var p3 = $imul(a3$2, b0$2);
  var p4 = $imul(a4$2, b0$2);
  if ((b1$2 !== 0)) {
    p1 = ((p1 + $imul(a0$2, b1$2)) | 0);
    p2 = ((p2 + $imul(a1$2, b1$2)) | 0);
    p3 = ((p3 + $imul(a2$2, b1$2)) | 0);
    p4 = ((p4 + $imul(a3$2, b1$2)) | 0)
  };
  if ((b2$2 !== 0)) {
    p2 = ((p2 + $imul(a0$2, b2$2)) | 0);
    p3 = ((p3 + $imul(a1$2, b2$2)) | 0);
    p4 = ((p4 + $imul(a2$2, b2$2)) | 0)
  };
  if ((b3$2 !== 0)) {
    p3 = ((p3 + $imul(a0$2, b3$2)) | 0);
    p4 = ((p4 + $imul(a1$2, b3$2)) | 0)
  };
  if ((b4$2 !== 0)) {
    p4 = ((p4 + $imul(a0$2, b4$2)) | 0)
  };
  var c00 = (4194303 & p0);
  var c01 = ((511 & p1) << 13);
  var c0 = ((c00 + c01) | 0);
  var c10 = (p0 >> 22);
  var c11 = (p1 >> 9);
  var c12 = ((262143 & p2) << 4);
  var c13 = ((31 & p3) << 17);
  var c1 = ((((((c10 + c11) | 0) + c12) | 0) + c13) | 0);
  var c22 = (p2 >> 18);
  var c23 = (p3 >> 5);
  var c24 = ((4095 & p4) << 8);
  var c2 = ((((c22 + c23) | 0) + c24) | 0);
  var c1n = ((c1 + (c0 >> 22)) | 0);
  var h = ((c2 + (c1n >> 22)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & c0), (4194303 & c1n), (1048575 & h))
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  this.l$2 = l;
  this.m$2 = m;
  this.h$2 = h;
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return $as_sjsr_RuntimeLong(this.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(y)[1])
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  if ((((this.l$2 === 0) && (this.m$2 === 0)) && (this.h$2 === 0))) {
    return "0"
  } else if (this.equals__sjsr_RuntimeLong__Z($m_sjsr_RuntimeLong$().MinValue$1)) {
    return "-9223372036854775808"
  } else if (((524288 & this.h$2) !== 0)) {
    return ("-" + this.unary$und$minus__sjsr_RuntimeLong().toString__T())
  } else {
    var tenPow9 = $m_sjsr_RuntimeLong$().TenPow9$1;
    var v = this;
    var acc = "";
    _toString0: while (true) {
      var this$1 = v;
      if ((((this$1.l$2 === 0) && (this$1.m$2 === 0)) && (this$1.h$2 === 0))) {
        return acc
      } else {
        var quotRem = v.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(tenPow9);
        var quot = $as_sjsr_RuntimeLong(quotRem[0]);
        var rem = $as_sjsr_RuntimeLong(quotRem[1]);
        var this$2 = rem.toInt__I();
        var digits = ("" + this$2);
        if ((((quot.l$2 === 0) && (quot.m$2 === 0)) && (quot.h$2 === 0))) {
          var zeroPrefix = ""
        } else {
          var beginIndex = $uI(digits["length"]);
          var zeroPrefix = $as_T("000000000"["substring"](beginIndex))
        };
        var temp$acc = ((zeroPrefix + digits) + acc);
        v = quot;
        acc = temp$acc;
        continue _toString0
      }
    }
  }
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(y) {
  return y.$$greater$eq__sjsr_RuntimeLong__Z(this)
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return this.compareTo__sjsr_RuntimeLong__I($as_sjsr_RuntimeLong(that))
});
$c_sjsr_RuntimeLong.prototype.scala$scalajs$runtime$RuntimeLong$$setBit__I__sjsr_RuntimeLong = (function(bit) {
  return ((bit < 22) ? new $c_sjsr_RuntimeLong().init___I__I__I((this.l$2 | (1 << bit)), this.m$2, this.h$2) : ((bit < 44) ? new $c_sjsr_RuntimeLong().init___I__I__I(this.l$2, (this.m$2 | (1 << (((-22) + bit) | 0))), this.h$2) : new $c_sjsr_RuntimeLong().init___I__I__I(this.l$2, this.m$2, (this.h$2 | (1 << (((-44) + bit) | 0))))))
});
$c_sjsr_RuntimeLong.prototype.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array = (function(y) {
  if ((((y.l$2 === 0) && (y.m$2 === 0)) && (y.h$2 === 0))) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  } else if ((((this.l$2 === 0) && (this.m$2 === 0)) && (this.h$2 === 0))) {
    return [$m_sjsr_RuntimeLong$().Zero$1, $m_sjsr_RuntimeLong$().Zero$1]
  } else if (y.equals__sjsr_RuntimeLong__Z($m_sjsr_RuntimeLong$().MinValue$1)) {
    return (this.equals__sjsr_RuntimeLong__Z($m_sjsr_RuntimeLong$().MinValue$1) ? [$m_sjsr_RuntimeLong$().One$1, $m_sjsr_RuntimeLong$().Zero$1] : [$m_sjsr_RuntimeLong$().Zero$1, this])
  } else {
    var xNegative = ((524288 & this.h$2) !== 0);
    var yNegative = ((524288 & y.h$2) !== 0);
    var xMinValue = this.equals__sjsr_RuntimeLong__Z($m_sjsr_RuntimeLong$().MinValue$1);
    var pow = y.powerOfTwo__p2__I();
    if ((pow >= 0)) {
      if (xMinValue) {
        var z = this.$$greater$greater__I__sjsr_RuntimeLong(pow);
        return [(yNegative ? z.unary$und$minus__sjsr_RuntimeLong() : z), $m_sjsr_RuntimeLong$().Zero$1]
      } else {
        var absX = (((524288 & this.h$2) !== 0) ? this.unary$und$minus__sjsr_RuntimeLong() : this);
        var absZ = absX.$$greater$greater__I__sjsr_RuntimeLong(pow);
        var z$2 = ((xNegative !== yNegative) ? absZ.unary$und$minus__sjsr_RuntimeLong() : absZ);
        var remAbs = ((pow <= 22) ? new $c_sjsr_RuntimeLong().init___I__I__I((absX.l$2 & (((-1) + (1 << pow)) | 0)), 0, 0) : ((pow <= 44) ? new $c_sjsr_RuntimeLong().init___I__I__I(absX.l$2, (absX.m$2 & (((-1) + (1 << (((-22) + pow) | 0))) | 0)), 0) : new $c_sjsr_RuntimeLong().init___I__I__I(absX.l$2, absX.m$2, (absX.h$2 & (((-1) + (1 << (((-44) + pow) | 0))) | 0)))));
        var rem = (xNegative ? remAbs.unary$und$minus__sjsr_RuntimeLong() : remAbs);
        return [z$2, rem]
      }
    } else {
      var absY = (((524288 & y.h$2) !== 0) ? y.unary$und$minus__sjsr_RuntimeLong() : y);
      if (xMinValue) {
        var newX = $m_sjsr_RuntimeLong$().MaxValue$1
      } else {
        var absX$2 = (((524288 & this.h$2) !== 0) ? this.unary$und$minus__sjsr_RuntimeLong() : this);
        if (absY.$$greater__sjsr_RuntimeLong__Z(absX$2)) {
          var newX;
          return [$m_sjsr_RuntimeLong$().Zero$1, this]
        } else {
          var newX = absX$2
        }
      };
      var shift = ((absY.numberOfLeadingZeros__I() - newX.numberOfLeadingZeros__I()) | 0);
      var yShift = absY.$$less$less__I__sjsr_RuntimeLong(shift);
      var shift$1 = shift;
      var yShift$1 = yShift;
      var curX = newX;
      var quot = $m_sjsr_RuntimeLong$().Zero$1;
      x: {
        var x1_$_$$und1$f;
        var x1_$_$$und2$f;
        _divide0: while (true) {
          if ((shift$1 < 0)) {
            var jsx$1 = true
          } else {
            var this$1 = curX;
            var jsx$1 = (((this$1.l$2 === 0) && (this$1.m$2 === 0)) && (this$1.h$2 === 0))
          };
          if (jsx$1) {
            var _1 = quot;
            var _2 = curX;
            var x1_$_$$und1$f = _1;
            var x1_$_$$und2$f = _2;
            break x
          } else {
            var this$2 = curX;
            var y$1 = yShift$1;
            var newX$1 = this$2.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y$1.unary$und$minus__sjsr_RuntimeLong());
            if (((524288 & newX$1.h$2) === 0)) {
              var temp$shift = (((-1) + shift$1) | 0);
              var temp$yShift = yShift$1.$$greater$greater__I__sjsr_RuntimeLong(1);
              var temp$quot = quot.scala$scalajs$runtime$RuntimeLong$$setBit__I__sjsr_RuntimeLong(shift$1);
              shift$1 = temp$shift;
              yShift$1 = temp$yShift;
              curX = newX$1;
              quot = temp$quot;
              continue _divide0
            } else {
              var temp$shift$2 = (((-1) + shift$1) | 0);
              var temp$yShift$2 = yShift$1.$$greater$greater__I__sjsr_RuntimeLong(1);
              shift$1 = temp$shift$2;
              yShift$1 = temp$yShift$2;
              continue _divide0
            }
          }
        }
      };
      var absQuot = $as_sjsr_RuntimeLong(x1_$_$$und1$f);
      var absRem = $as_sjsr_RuntimeLong(x1_$_$$und2$f);
      var x$3_$_$$und1$f = absQuot;
      var x$3_$_$$und2$f = absRem;
      var absQuot$2 = $as_sjsr_RuntimeLong(x$3_$_$$und1$f);
      var absRem$2 = $as_sjsr_RuntimeLong(x$3_$_$$und2$f);
      var quot$1 = ((xNegative !== yNegative) ? absQuot$2.unary$und$minus__sjsr_RuntimeLong() : absQuot$2);
      if ((xNegative && xMinValue)) {
        var this$3 = absRem$2.unary$und$minus__sjsr_RuntimeLong();
        var y$2 = $m_sjsr_RuntimeLong$().One$1;
        var rem$1 = this$3.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y$2.unary$und$minus__sjsr_RuntimeLong())
      } else {
        var rem$1 = (xNegative ? absRem$2.unary$und$minus__sjsr_RuntimeLong() : absRem$2)
      };
      return [quot$1, rem$1]
    }
  }
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new $c_sjsr_RuntimeLong().init___I__I__I((this.l$2 & y.l$2), (this.m$2 & y.m$2), (this.h$2 & y.h$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = ((this.l$2 >> n) | (this.m$2 << remBits));
    var m = ((this.m$2 >> n) | (this.h$2 << remBits));
    var h = ((this.h$2 >>> n) | 0);
    return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var l$1 = ((this.m$2 >> shfBits) | (this.h$2 << remBits$2));
    var m$1 = ((this.h$2 >>> shfBits) | 0);
    return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & l$1), (4194303 & m$1), 0)
  } else {
    var l$2 = ((this.h$2 >>> (((-44) + n) | 0)) | 0);
    return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & l$2), 0, 0)
  }
});
$c_sjsr_RuntimeLong.prototype.compareTo__sjsr_RuntimeLong__I = (function(that) {
  return (this.equals__sjsr_RuntimeLong__Z(that) ? 0 : (this.$$greater__sjsr_RuntimeLong__Z(that) ? 1 : (-1)))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(y) {
  return (((524288 & this.h$2) === 0) ? (((((524288 & y.h$2) !== 0) || (this.h$2 > y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 > y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 > y.l$2))) : (!(((((524288 & y.h$2) === 0) || (this.h$2 < y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 < y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 <= y.l$2)))))
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = (this.l$2 << n);
    var m = ((this.m$2 << n) | (this.l$2 >> remBits));
    var h = ((this.h$2 << n) | (this.m$2 >> remBits));
    return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var m$1 = (this.l$2 << shfBits);
    var h$1 = ((this.m$2 << shfBits) | (this.l$2 >> remBits$2));
    return new $c_sjsr_RuntimeLong().init___I__I__I(0, (4194303 & m$1), (1048575 & h$1))
  } else {
    var h$2 = (this.l$2 << (((-44) + n) | 0));
    return new $c_sjsr_RuntimeLong().init___I__I__I(0, 0, (1048575 & h$2))
  }
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return (this.l$2 | (this.m$2 << 22))
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I__I.call(this, (4194303 & value), (4194303 & (value >> 22)), ((value < 0) ? 1048575 : 0));
  return this
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(that) {
  return (!this.equals__sjsr_RuntimeLong__Z(that))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var neg0 = (4194303 & ((1 + (~this.l$2)) | 0));
  var neg1 = (4194303 & (((~this.m$2) + ((neg0 === 0) ? 1 : 0)) | 0));
  var neg2 = (1048575 & (((~this.h$2) + (((neg0 === 0) && (neg1 === 0)) ? 1 : 0)) | 0));
  return new $c_sjsr_RuntimeLong().init___I__I__I(neg0, neg1, neg2)
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return this.toShort__S()
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  var sum0 = ((this.l$2 + y.l$2) | 0);
  var sum1 = ((((this.m$2 + y.m$2) | 0) + (sum0 >> 22)) | 0);
  var sum2 = ((((this.h$2 + y.h$2) | 0) + (sum1 >> 22)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & sum0), (4194303 & sum1), (1048575 & sum2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  var negative = ((524288 & this.h$2) !== 0);
  var xh = (negative ? ((-1048576) | this.h$2) : this.h$2);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = ((this.l$2 >> n) | (this.m$2 << remBits));
    var m = ((this.m$2 >> n) | (xh << remBits));
    var h = (xh >> n);
    return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var l$1 = ((this.m$2 >> shfBits) | (xh << remBits$2));
    var m$1 = (xh >> shfBits);
    var h$1 = (negative ? 1048575 : 0);
    return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & l$1), (4194303 & m$1), (1048575 & h$1))
  } else {
    var l$2 = (xh >> (((-44) + n) | 0));
    var m$2 = (negative ? 4194303 : 0);
    var h$2 = (negative ? 1048575 : 0);
    return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & l$2), (4194303 & m$2), (1048575 & h$2))
  }
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return (this.equals__sjsr_RuntimeLong__Z($m_sjsr_RuntimeLong$().MinValue$1) ? (-9.223372036854776E18) : (((524288 & this.h$2) !== 0) ? (-this.unary$und$minus__sjsr_RuntimeLong().toDouble__D()) : ((this.l$2 + (4194304.0 * this.m$2)) + (1.7592186044416E13 * this.h$2))))
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return $as_sjsr_RuntimeLong(this.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(y)[0])
});
$c_sjsr_RuntimeLong.prototype.numberOfLeadingZeros__I = (function() {
  return ((this.h$2 !== 0) ? (((-12) + $m_jl_Integer$().numberOfLeadingZeros__I__I(this.h$2)) | 0) : ((this.m$2 !== 0) ? ((10 + $m_jl_Integer$().numberOfLeadingZeros__I__I(this.m$2)) | 0) : ((32 + $m_jl_Integer$().numberOfLeadingZeros__I__I(this.l$2)) | 0)))
});
$c_sjsr_RuntimeLong.prototype.toByte__B = (function() {
  return ((this.toInt__I() << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return this.toDouble__D()
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return this.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(this.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I()
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.toInt__I()
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  var l = (~this.l$2);
  var m = (~this.m$2);
  var h = (~this.h$2);
  return new $c_sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return this.compareTo__sjsr_RuntimeLong__I($as_sjsr_RuntimeLong(that))
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return this.toFloat__F()
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return this.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y.unary$und$minus__sjsr_RuntimeLong())
});
$c_sjsr_RuntimeLong.prototype.toFloat__F = (function() {
  return $fround(this.toDouble__D())
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new $c_sjsr_RuntimeLong().init___I__I__I((this.l$2 ^ y.l$2), (this.m$2 ^ y.m$2), (this.h$2 ^ y.h$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(y) {
  return (((this.l$2 === y.l$2) && (this.m$2 === y.m$2)) && (this.h$2 === y.h$2))
});
var $is_sjsr_RuntimeLong = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
});
var $as_sjsr_RuntimeLong = (function(obj) {
  return (($is_sjsr_RuntimeLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
});
var $isArrayOf_sjsr_RuntimeLong = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
});
var $asArrayOf_sjsr_RuntimeLong = (function(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
});
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
var $c_sjsr_RuntimeLong$ = (function() {
  $c_O.call(this);
  this.BITS$1 = 0;
  this.BITS01$1 = 0;
  this.BITS2$1 = 0;
  this.MASK$1 = 0;
  this.MASK$und2$1 = 0;
  this.SIGN$undBIT$1 = 0;
  this.SIGN$undBIT$undVALUE$1 = 0;
  this.TWO$undPWR$und15$undDBL$1 = 0.0;
  this.TWO$undPWR$und16$undDBL$1 = 0.0;
  this.TWO$undPWR$und22$undDBL$1 = 0.0;
  this.TWO$undPWR$und31$undDBL$1 = 0.0;
  this.TWO$undPWR$und32$undDBL$1 = 0.0;
  this.TWO$undPWR$und44$undDBL$1 = 0.0;
  this.TWO$undPWR$und63$undDBL$1 = 0.0;
  this.Zero$1 = null;
  this.One$1 = null;
  this.MinusOne$1 = null;
  this.MinValue$1 = null;
  this.MaxValue$1 = null;
  this.TenPow9$1 = null
});
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
var $h_sjsr_RuntimeLong$ = (function() {
  /*<skip>*/
});
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I__I(0, 0, 0);
  this.One$1 = new $c_sjsr_RuntimeLong().init___I__I__I(1, 0, 0);
  this.MinusOne$1 = new $c_sjsr_RuntimeLong().init___I__I__I(4194303, 4194303, 1048575);
  this.MinValue$1 = new $c_sjsr_RuntimeLong().init___I__I__I(0, 0, 524288);
  this.MaxValue$1 = new $c_sjsr_RuntimeLong().init___I__I__I(4194303, 4194303, 524287);
  this.TenPow9$1 = new $c_sjsr_RuntimeLong().init___I__I__I(1755648, 238, 0);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  if ((value !== value)) {
    return this.Zero$1
  } else if ((value < (-9.223372036854776E18))) {
    return this.MinValue$1
  } else if ((value >= 9.223372036854776E18)) {
    return this.MaxValue$1
  } else if ((value < 0)) {
    return this.fromDouble__D__sjsr_RuntimeLong((-value)).unary$und$minus__sjsr_RuntimeLong()
  } else {
    var acc = value;
    var a2 = ((acc >= 1.7592186044416E13) ? ((acc / 1.7592186044416E13) | 0) : 0);
    acc = (acc - (1.7592186044416E13 * a2));
    var a1 = ((acc >= 4194304.0) ? ((acc / 4194304.0) | 0) : 0);
    acc = (acc - (4194304.0 * a1));
    var a0 = (acc | 0);
    return new $c_sjsr_RuntimeLong().init___I__I__I(a0, a1, a2)
  }
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
var $m_sjsr_RuntimeLong$ = (function() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
});
var $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps = (function() {
  $c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor.call(this);
  this.jsCtor$2 = null;
  this.key$2 = null;
  this.ref$2 = null;
  this.props$2 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype = new $h_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor();
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentC$ConstProps = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype = $c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype.apply__sc_Seq__Ljapgolly_scalajs_react_ReactComponentU = (function(children) {
  var jsx$4 = this.jsCtor$2;
  var jsx$3 = this.mkProps__O__Ljapgolly_scalajs_react_package$WrapObj(this.props$2.apply__O());
  var this$1 = $m_sjsr_package$();
  if ($is_sjs_js_ArrayOps(children)) {
    var x2 = $as_sjs_js_ArrayOps(children);
    var jsx$2 = x2.scala$scalajs$js$ArrayOps$$array$f
  } else if ($is_sjs_js_WrappedArray(children)) {
    var x3 = $as_sjs_js_WrappedArray(children);
    var jsx$2 = x3.array$6
  } else {
    var result = [];
    children.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, result$1) {
      return (function(x$2) {
        return $uI(result$1["push"](x$2))
      })
    })(this$1, result)));
    var jsx$2 = result
  };
  var jsx$1 = [jsx$3]["concat"](jsx$2);
  return jsx$4["apply"]((void 0), jsx$1)
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype.set__sjs_js_UndefOr__sjs_js_UndefOr__Ljapgolly_scalajs_react_ReactComponentC$BaseCtor = (function(key, ref) {
  return this.set__sjs_js_UndefOr__sjs_js_UndefOr__Ljapgolly_scalajs_react_ReactComponentC$ConstProps(key, ref)
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype.ref__sjs_js_UndefOr = (function() {
  return this.ref$2
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype.key__sjs_js_UndefOr = (function() {
  return this.key$2
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype.init___Ljapgolly_scalajs_react_ReactComponentCU__sjs_js_UndefOr__sjs_js_UndefOr__F0 = (function(jsCtor, key, ref, props) {
  this.jsCtor$2 = jsCtor;
  this.key$2 = key;
  this.ref$2 = ref;
  this.props$2 = props;
  return this
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype.set__sjs_js_UndefOr__sjs_js_UndefOr__Ljapgolly_scalajs_react_ReactComponentC$ConstProps = (function(key, ref) {
  return new $c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps().init___Ljapgolly_scalajs_react_ReactComponentCU__sjs_js_UndefOr__sjs_js_UndefOr__F0(this.jsCtor$2, key, ref, this.props$2)
});
var $is_Ljapgolly_scalajs_react_ReactComponentC$ConstProps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_ReactComponentC$ConstProps)))
});
var $as_Ljapgolly_scalajs_react_ReactComponentC$ConstProps = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_ReactComponentC$ConstProps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.ReactComponentC$ConstProps"))
});
var $isArrayOf_Ljapgolly_scalajs_react_ReactComponentC$ConstProps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_ReactComponentC$ConstProps)))
});
var $asArrayOf_Ljapgolly_scalajs_react_ReactComponentC$ConstProps = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_ReactComponentC$ConstProps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.ReactComponentC$ConstProps;", depth))
});
var $d_Ljapgolly_scalajs_react_ReactComponentC$ConstProps = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentC$ConstProps: 0
}, false, "japgolly.scalajs.react.ReactComponentC$ConstProps", {
  Ljapgolly_scalajs_react_ReactComponentC$ConstProps: 1,
  Ljapgolly_scalajs_react_ReactComponentC$BaseCtor: 1,
  O: 1,
  Ljapgolly_scalajs_react_ReactComponentC: 1,
  Ljapgolly_scalajs_react_package$ReactComponentTypeAux: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ConstProps.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentC$ConstProps;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps = (function() {
  $c_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor.call(this);
  this.jsCtor$2 = null;
  this.key$2 = null;
  this.ref$2 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype = new $h_Ljapgolly_scalajs_react_ReactComponentC$BaseCtor();
$c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentC$ReqProps = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype = $c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype.init___Ljapgolly_scalajs_react_ReactComponentCU__sjs_js_UndefOr__sjs_js_UndefOr = (function(jsCtor, key, ref) {
  this.jsCtor$2 = jsCtor;
  this.key$2 = key;
  this.ref$2 = ref;
  return this
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype.set__sjs_js_UndefOr__sjs_js_UndefOr__Ljapgolly_scalajs_react_ReactComponentC$BaseCtor = (function(key, ref) {
  return new $c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps().init___Ljapgolly_scalajs_react_ReactComponentCU__sjs_js_UndefOr__sjs_js_UndefOr(this.jsCtor$2, key, ref)
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype.ref__sjs_js_UndefOr = (function() {
  return this.ref$2
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype.key__sjs_js_UndefOr = (function() {
  return this.key$2
});
var $is_Ljapgolly_scalajs_react_ReactComponentC$ReqProps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_ReactComponentC$ReqProps)))
});
var $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_ReactComponentC$ReqProps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.ReactComponentC$ReqProps"))
});
var $isArrayOf_Ljapgolly_scalajs_react_ReactComponentC$ReqProps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_ReactComponentC$ReqProps)))
});
var $asArrayOf_Ljapgolly_scalajs_react_ReactComponentC$ReqProps = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_ReactComponentC$ReqProps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.ReactComponentC$ReqProps;", depth))
});
var $d_Ljapgolly_scalajs_react_ReactComponentC$ReqProps = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentC$ReqProps: 0
}, false, "japgolly.scalajs.react.ReactComponentC$ReqProps", {
  Ljapgolly_scalajs_react_ReactComponentC$ReqProps: 1,
  Ljapgolly_scalajs_react_ReactComponentC$BaseCtor: 1,
  O: 1,
  Ljapgolly_scalajs_react_ReactComponentC: 1,
  Ljapgolly_scalajs_react_package$ReactComponentTypeAux: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentC$ReqProps.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentC$ReqProps;
/** @constructor */
var $c_Ljava_io_FilterOutputStream = (function() {
  $c_Ljava_io_OutputStream.call(this);
  this.out$2 = null
});
$c_Ljava_io_FilterOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_Ljava_io_FilterOutputStream.prototype.constructor = $c_Ljava_io_FilterOutputStream;
/** @constructor */
var $h_Ljava_io_FilterOutputStream = (function() {
  /*<skip>*/
});
$h_Ljava_io_FilterOutputStream.prototype = $c_Ljava_io_FilterOutputStream.prototype;
$c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  this.out$2 = out;
  return this
});
var $is_T = (function(obj) {
  return ((typeof obj) === "string")
});
var $as_T = (function(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
});
var $isArrayOf_T = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
});
var $asArrayOf_T = (function(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
});
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), $is_T);
/** @constructor */
var $c_jl_AssertionError = (function() {
  $c_jl_Error.call(this)
});
$c_jl_AssertionError.prototype = new $h_jl_Error();
$c_jl_AssertionError.prototype.constructor = $c_jl_AssertionError;
/** @constructor */
var $h_jl_AssertionError = (function() {
  /*<skip>*/
});
$h_jl_AssertionError.prototype = $c_jl_AssertionError.prototype;
$c_jl_AssertionError.prototype.init___O = (function(o) {
  $c_jl_AssertionError.prototype.init___T.call(this, $objectToString(o));
  return this
});
var $d_jl_AssertionError = new $TypeData().initClass({
  jl_AssertionError: 0
}, false, "java.lang.AssertionError", {
  jl_AssertionError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_AssertionError.prototype.$classData = $d_jl_AssertionError;
/** @constructor */
var $c_jl_CloneNotSupportedException = (function() {
  $c_jl_Exception.call(this)
});
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
var $h_jl_CloneNotSupportedException = (function() {
  /*<skip>*/
});
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_CloneNotSupportedException.prototype.init___T.call(this, null);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
var $is_jl_InterruptedException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_InterruptedException)))
});
var $as_jl_InterruptedException = (function(obj) {
  return (($is_jl_InterruptedException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.InterruptedException"))
});
var $isArrayOf_jl_InterruptedException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_InterruptedException)))
});
var $asArrayOf_jl_InterruptedException = (function(obj, depth) {
  return (($isArrayOf_jl_InterruptedException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.InterruptedException;", depth))
});
/** @constructor */
var $c_jl_JSConsoleBasedPrintStream$DummyOutputStream = (function() {
  $c_Ljava_io_OutputStream.call(this)
});
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
var $h_jl_JSConsoleBasedPrintStream$DummyOutputStream = (function() {
  /*<skip>*/
});
$h_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype;
var $d_jl_JSConsoleBasedPrintStream$DummyOutputStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1
});
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream$DummyOutputStream;
var $is_jl_LinkageError = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_LinkageError)))
});
var $as_jl_LinkageError = (function(obj) {
  return (($is_jl_LinkageError(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.LinkageError"))
});
var $isArrayOf_jl_LinkageError = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_LinkageError)))
});
var $asArrayOf_jl_LinkageError = (function(obj, depth) {
  return (($isArrayOf_jl_LinkageError(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.LinkageError;", depth))
});
/** @constructor */
var $c_jl_RuntimeException = (function() {
  $c_jl_Exception.call(this)
});
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
var $h_jl_RuntimeException = (function() {
  /*<skip>*/
});
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
$c_jl_RuntimeException.prototype.init___ = (function() {
  $c_jl_RuntimeException.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_jl_RuntimeException.prototype.init___T = (function(s) {
  $c_jl_RuntimeException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_RuntimeException = new $TypeData().initClass({
  jl_RuntimeException: 0
}, false, "java.lang.RuntimeException", {
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_RuntimeException.prototype.$classData = $d_jl_RuntimeException;
/** @constructor */
var $c_jl_StringBuilder = (function() {
  $c_O.call(this);
  this.content$1 = null
});
$c_jl_StringBuilder.prototype = new $h_O();
$c_jl_StringBuilder.prototype.constructor = $c_jl_StringBuilder;
/** @constructor */
var $h_jl_StringBuilder = (function() {
  /*<skip>*/
});
$h_jl_StringBuilder.prototype = $c_jl_StringBuilder.prototype;
$c_jl_StringBuilder.prototype.init___ = (function() {
  $c_jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuilder.prototype.append__T__jl_StringBuilder = (function(s) {
  this.content$1 = (("" + this.content$1) + ((s === null) ? "null" : s));
  return this
});
$c_jl_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var thiz = this.content$1;
  return $as_T(thiz["substring"](start, end))
});
$c_jl_StringBuilder.prototype.toString__T = (function() {
  return this.content$1
});
$c_jl_StringBuilder.prototype.init___jl_CharSequence = (function(csq) {
  $c_jl_StringBuilder.prototype.init___T.call(this, $objectToString(csq));
  return this
});
$c_jl_StringBuilder.prototype.append__O__jl_StringBuilder = (function(obj) {
  return ((obj === null) ? this.append__T__jl_StringBuilder(null) : this.append__T__jl_StringBuilder($objectToString(obj)))
});
$c_jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  $c_jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuilder.prototype.append__jl_CharSequence__I__I__jl_StringBuilder = (function(csq, start, end) {
  return ((csq === null) ? this.append__jl_CharSequence__I__I__jl_StringBuilder("null", start, end) : this.append__T__jl_StringBuilder($objectToString($charSequenceSubSequence(csq, start, end))))
});
$c_jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  return this.append__T__jl_StringBuilder($as_T($g["String"]["fromCharCode"](c)))
});
$c_jl_StringBuilder.prototype.init___T = (function(content) {
  this.content$1 = content;
  return this
});
$c_jl_StringBuilder.prototype.reverse__jl_StringBuilder = (function() {
  var original = this.content$1;
  var result = "";
  var i = 0;
  while ((i < $uI(original["length"]))) {
    var index = i;
    var c = (65535 & $uI(original["charCodeAt"](index)));
    if ((((64512 & c) === 55296) && (((1 + i) | 0) < $uI(original["length"])))) {
      var index$1 = ((1 + i) | 0);
      var c2 = (65535 & $uI(original["charCodeAt"](index$1)));
      if (((64512 & c2) === 56320)) {
        result = ((("" + $as_T($g["String"]["fromCharCode"](c))) + $as_T($g["String"]["fromCharCode"](c2))) + result);
        i = ((2 + i) | 0)
      } else {
        result = (("" + $as_T($g["String"]["fromCharCode"](c))) + result);
        i = ((1 + i) | 0)
      }
    } else {
      result = (("" + $as_T($g["String"]["fromCharCode"](c))) + result);
      i = ((1 + i) | 0)
    }
  };
  this.content$1 = result;
  return this
});
var $d_jl_StringBuilder = new $TypeData().initClass({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuilder.prototype.$classData = $d_jl_StringBuilder;
var $is_jl_ThreadDeath = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ThreadDeath)))
});
var $as_jl_ThreadDeath = (function(obj) {
  return (($is_jl_ThreadDeath(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ThreadDeath"))
});
var $isArrayOf_jl_ThreadDeath = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ThreadDeath)))
});
var $asArrayOf_jl_ThreadDeath = (function(obj, depth) {
  return (($isArrayOf_jl_ThreadDeath(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ThreadDeath;", depth))
});
var $is_jl_VirtualMachineError = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_VirtualMachineError)))
});
var $as_jl_VirtualMachineError = (function(obj) {
  return (($is_jl_VirtualMachineError(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.VirtualMachineError"))
});
var $isArrayOf_jl_VirtualMachineError = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_VirtualMachineError)))
});
var $asArrayOf_jl_VirtualMachineError = (function(obj, depth) {
  return (($isArrayOf_jl_VirtualMachineError(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.VirtualMachineError;", depth))
});
/** @constructor */
var $c_ju_concurrent_ExecutionException = (function() {
  $c_jl_Exception.call(this)
});
$c_ju_concurrent_ExecutionException.prototype = new $h_jl_Exception();
$c_ju_concurrent_ExecutionException.prototype.constructor = $c_ju_concurrent_ExecutionException;
/** @constructor */
var $h_ju_concurrent_ExecutionException = (function() {
  /*<skip>*/
});
$h_ju_concurrent_ExecutionException.prototype = $c_ju_concurrent_ExecutionException.prototype;
var $d_ju_concurrent_ExecutionException = new $TypeData().initClass({
  ju_concurrent_ExecutionException: 0
}, false, "java.util.concurrent.ExecutionException", {
  ju_concurrent_ExecutionException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_concurrent_ExecutionException.prototype.$classData = $d_ju_concurrent_ExecutionException;
/** @constructor */
var $c_s_Array$ = (function() {
  $c_s_FallbackArrayBuilding.call(this);
  this.emptyBooleanArray$2 = null;
  this.emptyByteArray$2 = null;
  this.emptyCharArray$2 = null;
  this.emptyDoubleArray$2 = null;
  this.emptyFloatArray$2 = null;
  this.emptyIntArray$2 = null;
  this.emptyLongArray$2 = null;
  this.emptyShortArray$2 = null;
  this.emptyObjectArray$2 = null
});
$c_s_Array$.prototype = new $h_s_FallbackArrayBuilding();
$c_s_Array$.prototype.constructor = $c_s_Array$;
/** @constructor */
var $h_s_Array$ = (function() {
  /*<skip>*/
});
$h_s_Array$.prototype = $c_s_Array$.prototype;
$c_s_Array$.prototype.init___ = (function() {
  $n_s_Array$ = this;
  this.emptyBooleanArray$2 = $newArrayObject($d_Z.getArrayOf(), [0]);
  this.emptyByteArray$2 = $newArrayObject($d_B.getArrayOf(), [0]);
  this.emptyCharArray$2 = $newArrayObject($d_C.getArrayOf(), [0]);
  this.emptyDoubleArray$2 = $newArrayObject($d_D.getArrayOf(), [0]);
  this.emptyFloatArray$2 = $newArrayObject($d_F.getArrayOf(), [0]);
  this.emptyIntArray$2 = $newArrayObject($d_I.getArrayOf(), [0]);
  this.emptyLongArray$2 = $newArrayObject($d_J.getArrayOf(), [0]);
  this.emptyShortArray$2 = $newArrayObject($d_S.getArrayOf(), [0]);
  this.emptyObjectArray$2 = $newArrayObject($d_O.getArrayOf(), [0]);
  return this
});
$c_s_Array$.prototype.slowcopy__p2__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
$c_s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = $objectGetClass(src);
  if ((srcClass.isArray__Z() && $objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    $systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
var $d_s_Array$ = new $TypeData().initClass({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Array$.prototype.$classData = $d_s_Array$;
var $n_s_Array$ = (void 0);
var $m_s_Array$ = (function() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$().init___()
  };
  return $n_s_Array$
});
/** @constructor */
var $c_s_Predef$$eq$colon$eq = (function() {
  $c_O.call(this)
});
$c_s_Predef$$eq$colon$eq.prototype = new $h_O();
$c_s_Predef$$eq$colon$eq.prototype.constructor = $c_s_Predef$$eq$colon$eq;
/** @constructor */
var $h_s_Predef$$eq$colon$eq = (function() {
  /*<skip>*/
});
$h_s_Predef$$eq$colon$eq.prototype = $c_s_Predef$$eq$colon$eq.prototype;
$c_s_Predef$$eq$colon$eq.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$eq$colon$eq.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
var $c_s_Predef$$less$colon$less = (function() {
  $c_O.call(this)
});
$c_s_Predef$$less$colon$less.prototype = new $h_O();
$c_s_Predef$$less$colon$less.prototype.constructor = $c_s_Predef$$less$colon$less;
/** @constructor */
var $h_s_Predef$$less$colon$less = (function() {
  /*<skip>*/
});
$h_s_Predef$$less$colon$less.prototype = $c_s_Predef$$less$colon$less.prototype;
$c_s_Predef$$less$colon$less.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$less$colon$less.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
var $c_s_math_Equiv$ = (function() {
  $c_O.call(this)
});
$c_s_math_Equiv$.prototype = new $h_O();
$c_s_math_Equiv$.prototype.constructor = $c_s_math_Equiv$;
/** @constructor */
var $h_s_math_Equiv$ = (function() {
  /*<skip>*/
});
$h_s_math_Equiv$.prototype = $c_s_math_Equiv$.prototype;
$c_s_math_Equiv$.prototype.init___ = (function() {
  $n_s_math_Equiv$ = this;
  return this
});
var $d_s_math_Equiv$ = new $TypeData().initClass({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Equiv$.prototype.$classData = $d_s_math_Equiv$;
var $n_s_math_Equiv$ = (void 0);
var $m_s_math_Equiv$ = (function() {
  if ((!$n_s_math_Equiv$)) {
    $n_s_math_Equiv$ = new $c_s_math_Equiv$().init___()
  };
  return $n_s_math_Equiv$
});
/** @constructor */
var $c_s_math_Ordering$ = (function() {
  $c_O.call(this)
});
$c_s_math_Ordering$.prototype = new $h_O();
$c_s_math_Ordering$.prototype.constructor = $c_s_math_Ordering$;
/** @constructor */
var $h_s_math_Ordering$ = (function() {
  /*<skip>*/
});
$h_s_math_Ordering$.prototype = $c_s_math_Ordering$.prototype;
$c_s_math_Ordering$.prototype.init___ = (function() {
  $n_s_math_Ordering$ = this;
  return this
});
var $d_s_math_Ordering$ = new $TypeData().initClass({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$.prototype.$classData = $d_s_math_Ordering$;
var $n_s_math_Ordering$ = (void 0);
var $m_s_math_Ordering$ = (function() {
  if ((!$n_s_math_Ordering$)) {
    $n_s_math_Ordering$ = new $c_s_math_Ordering$().init___()
  };
  return $n_s_math_Ordering$
});
/** @constructor */
var $c_s_reflect_NoManifest$ = (function() {
  $c_O.call(this)
});
$c_s_reflect_NoManifest$.prototype = new $h_O();
$c_s_reflect_NoManifest$.prototype.constructor = $c_s_reflect_NoManifest$;
/** @constructor */
var $h_s_reflect_NoManifest$ = (function() {
  /*<skip>*/
});
$h_s_reflect_NoManifest$.prototype = $c_s_reflect_NoManifest$.prototype;
$c_s_reflect_NoManifest$.prototype.toString__T = (function() {
  return "<?>"
});
var $d_s_reflect_NoManifest$ = new $TypeData().initClass({
  s_reflect_NoManifest$: 0
}, false, "scala.reflect.NoManifest$", {
  s_reflect_NoManifest$: 1,
  O: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_NoManifest$.prototype.$classData = $d_s_reflect_NoManifest$;
var $n_s_reflect_NoManifest$ = (void 0);
var $m_s_reflect_NoManifest$ = (function() {
  if ((!$n_s_reflect_NoManifest$)) {
    $n_s_reflect_NoManifest$ = new $c_s_reflect_NoManifest$().init___()
  };
  return $n_s_reflect_NoManifest$
});
/** @constructor */
var $c_sc_AbstractIterator = (function() {
  $c_O.call(this)
});
$c_sc_AbstractIterator.prototype = new $h_O();
$c_sc_AbstractIterator.prototype.constructor = $c_sc_AbstractIterator;
/** @constructor */
var $h_sc_AbstractIterator = (function() {
  /*<skip>*/
});
$h_sc_AbstractIterator.prototype = $c_sc_AbstractIterator.prototype;
$c_sc_AbstractIterator.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sc_AbstractIterator.prototype.init___ = (function() {
  return this
});
$c_sc_AbstractIterator.prototype.toList__sci_List = (function() {
  var this$1 = $m_sci_List$();
  var cbf = this$1.ReusableCBFInstance$2;
  return $as_sci_List($s_sc_TraversableOnce$class__to__sc_TraversableOnce__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return $s_sc_Iterator$class__isEmpty__sc_Iterator__Z(this)
});
$c_sc_AbstractIterator.prototype.mkString__T__T = (function(sep) {
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, "", sep, "")
});
$c_sc_AbstractIterator.prototype.toString__T = (function() {
  return $s_sc_Iterator$class__toString__sc_Iterator__T(this)
});
$c_sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  $s_sc_Iterator$class__foreach__sc_Iterator__F1__V(this, f)
});
$c_sc_AbstractIterator.prototype.size__I = (function() {
  return $s_sc_TraversableOnce$class__size__sc_TraversableOnce__I(this)
});
$c_sc_AbstractIterator.prototype.toStream__sci_Stream = (function() {
  return $s_sc_Iterator$class__toStream__sc_Iterator__sci_Stream(this)
});
$c_sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
/** @constructor */
var $c_scg_SetFactory = (function() {
  $c_scg_GenSetFactory.call(this)
});
$c_scg_SetFactory.prototype = new $h_scg_GenSetFactory();
$c_scg_SetFactory.prototype.constructor = $c_scg_SetFactory;
/** @constructor */
var $h_scg_SetFactory = (function() {
  /*<skip>*/
});
$h_scg_SetFactory.prototype = $c_scg_SetFactory.prototype;
/** @constructor */
var $c_sci_ListSet$ListSetBuilder = (function() {
  $c_O.call(this);
  this.elems$1 = null;
  this.seen$1 = null
});
$c_sci_ListSet$ListSetBuilder.prototype = new $h_O();
$c_sci_ListSet$ListSetBuilder.prototype.constructor = $c_sci_ListSet$ListSetBuilder;
/** @constructor */
var $h_sci_ListSet$ListSetBuilder = (function() {
  /*<skip>*/
});
$h_sci_ListSet$ListSetBuilder.prototype = $c_sci_ListSet$ListSetBuilder.prototype;
$c_sci_ListSet$ListSetBuilder.prototype.result__sci_ListSet = (function() {
  var this$2 = this.elems$1;
  var z = $m_sci_ListSet$EmptyListSet$();
  var this$3 = this$2.scala$collection$mutable$ListBuffer$$start$6;
  var acc = z;
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = acc;
    var arg2 = these.head__O();
    var x$1 = $as_sci_ListSet(arg1);
    acc = new $c_sci_ListSet$Node().init___sci_ListSet__O(x$1, arg2);
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return $as_sci_ListSet(acc)
});
$c_sci_ListSet$ListSetBuilder.prototype.init___ = (function() {
  $c_sci_ListSet$ListSetBuilder.prototype.init___sci_ListSet.call(this, $m_sci_ListSet$EmptyListSet$());
  return this
});
$c_sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_ListSet$ListSetBuilder(elem)
});
$c_sci_ListSet$ListSetBuilder.prototype.init___sci_ListSet = (function(initial) {
  var this$1 = new $c_scm_ListBuffer().init___().$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(initial);
  this.elems$1 = $as_scm_ListBuffer($s_sc_SeqLike$class__reverse__sc_SeqLike__O(this$1));
  var this$2 = new $c_scm_HashSet().init___();
  this.seen$1 = $as_scm_HashSet($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this$2, initial));
  return this
});
$c_sci_ListSet$ListSetBuilder.prototype.result__O = (function() {
  return this.result__sci_ListSet()
});
$c_sci_ListSet$ListSetBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_ListSet$ListSetBuilder(elem)
});
$c_sci_ListSet$ListSetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__sci_ListSet$ListSetBuilder = (function(x) {
  var this$1 = this.seen$1;
  if ((!$s_scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z(this$1, x))) {
    this.elems$1.$$plus$eq__O__scm_ListBuffer(x);
    this.seen$1.$$plus$eq__O__scm_HashSet(x)
  };
  return this
});
$c_sci_ListSet$ListSetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_sci_ListSet$ListSetBuilder = new $TypeData().initClass({
  sci_ListSet$ListSetBuilder: 0
}, false, "scala.collection.immutable.ListSet$ListSetBuilder", {
  sci_ListSet$ListSetBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_ListSet$ListSetBuilder.prototype.$classData = $d_sci_ListSet$ListSetBuilder;
/** @constructor */
var $c_sci_Map$ = (function() {
  $c_scg_ImmutableMapFactory.call(this)
});
$c_sci_Map$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_Map$.prototype.constructor = $c_sci_Map$;
/** @constructor */
var $h_sci_Map$ = (function() {
  /*<skip>*/
});
$h_sci_Map$.prototype = $c_sci_Map$.prototype;
$c_sci_Map$.prototype.empty__sc_GenMap = (function() {
  return $m_sci_Map$EmptyMap$()
});
var $d_sci_Map$ = new $TypeData().initClass({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1
});
$c_sci_Map$.prototype.$classData = $d_sci_Map$;
var $n_sci_Map$ = (void 0);
var $m_sci_Map$ = (function() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$().init___()
  };
  return $n_sci_Map$
});
/** @constructor */
var $c_scm_GrowingBuilder = (function() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
});
$c_scm_GrowingBuilder.prototype = new $h_O();
$c_scm_GrowingBuilder.prototype.constructor = $c_scm_GrowingBuilder;
/** @constructor */
var $h_scm_GrowingBuilder = (function() {
  /*<skip>*/
});
$h_scm_GrowingBuilder.prototype = $c_scm_GrowingBuilder.prototype;
$c_scm_GrowingBuilder.prototype.init___scg_Growable = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_GrowingBuilder = (function(x) {
  this.elems$1.$$plus$eq__O__scg_Growable(x);
  return this
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_GrowingBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_GrowingBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_GrowingBuilder = new $TypeData().initClass({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_GrowingBuilder.prototype.$classData = $d_scm_GrowingBuilder;
/** @constructor */
var $c_scm_LazyBuilder = (function() {
  $c_O.call(this);
  this.parts$1 = null
});
$c_scm_LazyBuilder.prototype = new $h_O();
$c_scm_LazyBuilder.prototype.constructor = $c_scm_LazyBuilder;
/** @constructor */
var $h_scm_LazyBuilder = (function() {
  /*<skip>*/
});
$h_scm_LazyBuilder.prototype = $c_scm_LazyBuilder.prototype;
$c_scm_LazyBuilder.prototype.init___ = (function() {
  this.parts$1 = new $c_scm_ListBuffer().init___();
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder = (function(xs) {
  this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_LazyBuilder = (function(x) {
  var jsx$1 = this.parts$1;
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([x]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  jsx$1.$$plus$eq__O__scm_ListBuffer($as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf)));
  return this
});
$c_scm_LazyBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
});
/** @constructor */
var $c_scm_MapBuilder = (function() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
});
$c_scm_MapBuilder.prototype = new $h_O();
$c_scm_MapBuilder.prototype.constructor = $c_scm_MapBuilder;
/** @constructor */
var $h_scm_MapBuilder = (function() {
  /*<skip>*/
});
$h_scm_MapBuilder.prototype = $c_scm_MapBuilder.prototype;
$c_scm_MapBuilder.prototype.$$plus$eq__T2__scm_MapBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__T2__sc_GenMap(x);
  return this
});
$c_scm_MapBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__T2__scm_MapBuilder($as_T2(elem))
});
$c_scm_MapBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_MapBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_MapBuilder.prototype.init___sc_GenMap = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_MapBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__T2__scm_MapBuilder($as_T2(elem))
});
$c_scm_MapBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_MapBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_MapBuilder = new $TypeData().initClass({
  scm_MapBuilder: 0
}, false, "scala.collection.mutable.MapBuilder", {
  scm_MapBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_MapBuilder.prototype.$classData = $d_scm_MapBuilder;
/** @constructor */
var $c_scm_SetBuilder = (function() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
});
$c_scm_SetBuilder.prototype = new $h_O();
$c_scm_SetBuilder.prototype.constructor = $c_scm_SetBuilder;
/** @constructor */
var $h_scm_SetBuilder = (function() {
  /*<skip>*/
});
$h_scm_SetBuilder.prototype = $c_scm_SetBuilder.prototype;
$c_scm_SetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_SetBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_SetBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__O__sc_Set(x);
  return this
});
$c_scm_SetBuilder.prototype.init___sc_Set = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_SetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_SetBuilder = new $TypeData().initClass({
  scm_SetBuilder: 0
}, false, "scala.collection.mutable.SetBuilder", {
  scm_SetBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_SetBuilder.prototype.$classData = $d_scm_SetBuilder;
/** @constructor */
var $c_sjs_concurrent_QueueExecutionContext$ = (function() {
  $c_O.call(this)
});
$c_sjs_concurrent_QueueExecutionContext$.prototype = new $h_O();
$c_sjs_concurrent_QueueExecutionContext$.prototype.constructor = $c_sjs_concurrent_QueueExecutionContext$;
/** @constructor */
var $h_sjs_concurrent_QueueExecutionContext$ = (function() {
  /*<skip>*/
});
$h_sjs_concurrent_QueueExecutionContext$.prototype = $c_sjs_concurrent_QueueExecutionContext$.prototype;
$c_sjs_concurrent_QueueExecutionContext$.prototype.init___ = (function() {
  $n_sjs_concurrent_QueueExecutionContext$ = this;
  return this
});
$c_sjs_concurrent_QueueExecutionContext$.prototype.reportFailure__jl_Throwable__V = (function(t) {
  t.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
});
$c_sjs_concurrent_QueueExecutionContext$.prototype.execute__jl_Runnable__V = (function(runnable) {
  $m_sjs_js_timers_package$().setTimeout__D__F0__sjs_js_timers_SetTimeoutHandle(0.0, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, runnable$1) {
    return (function() {
      try {
        runnable$1.run__V()
      } catch (e) {
        var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
        if ((e$2 !== null)) {
          e$2.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
        } else {
          throw e
        }
      }
    })
  })(this, runnable)))
});
var $d_sjs_concurrent_QueueExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_QueueExecutionContext$: 0
}, false, "scala.scalajs.concurrent.QueueExecutionContext$", {
  sjs_concurrent_QueueExecutionContext$: 1,
  O: 1,
  s_concurrent_ExecutionContextExecutor: 1,
  s_concurrent_ExecutionContext: 1,
  ju_concurrent_Executor: 1
});
$c_sjs_concurrent_QueueExecutionContext$.prototype.$classData = $d_sjs_concurrent_QueueExecutionContext$;
var $n_sjs_concurrent_QueueExecutionContext$ = (void 0);
var $m_sjs_concurrent_QueueExecutionContext$ = (function() {
  if ((!$n_sjs_concurrent_QueueExecutionContext$)) {
    $n_sjs_concurrent_QueueExecutionContext$ = new $c_sjs_concurrent_QueueExecutionContext$().init___()
  };
  return $n_sjs_concurrent_QueueExecutionContext$
});
/** @constructor */
var $c_sjs_concurrent_RunNowExecutionContext$ = (function() {
  $c_O.call(this)
});
$c_sjs_concurrent_RunNowExecutionContext$.prototype = new $h_O();
$c_sjs_concurrent_RunNowExecutionContext$.prototype.constructor = $c_sjs_concurrent_RunNowExecutionContext$;
/** @constructor */
var $h_sjs_concurrent_RunNowExecutionContext$ = (function() {
  /*<skip>*/
});
$h_sjs_concurrent_RunNowExecutionContext$.prototype = $c_sjs_concurrent_RunNowExecutionContext$.prototype;
$c_sjs_concurrent_RunNowExecutionContext$.prototype.init___ = (function() {
  $n_sjs_concurrent_RunNowExecutionContext$ = this;
  return this
});
$c_sjs_concurrent_RunNowExecutionContext$.prototype.reportFailure__jl_Throwable__V = (function(t) {
  t.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
});
$c_sjs_concurrent_RunNowExecutionContext$.prototype.execute__jl_Runnable__V = (function(runnable) {
  try {
    runnable.run__V()
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      e$2.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
    } else {
      throw e
    }
  }
});
var $d_sjs_concurrent_RunNowExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_RunNowExecutionContext$: 0
}, false, "scala.scalajs.concurrent.RunNowExecutionContext$", {
  sjs_concurrent_RunNowExecutionContext$: 1,
  O: 1,
  s_concurrent_ExecutionContextExecutor: 1,
  s_concurrent_ExecutionContext: 1,
  ju_concurrent_Executor: 1
});
$c_sjs_concurrent_RunNowExecutionContext$.prototype.$classData = $d_sjs_concurrent_RunNowExecutionContext$;
var $n_sjs_concurrent_RunNowExecutionContext$ = (void 0);
var $m_sjs_concurrent_RunNowExecutionContext$ = (function() {
  if ((!$n_sjs_concurrent_RunNowExecutionContext$)) {
    $n_sjs_concurrent_RunNowExecutionContext$ = new $c_sjs_concurrent_RunNowExecutionContext$().init___()
  };
  return $n_sjs_concurrent_RunNowExecutionContext$
});
/** @constructor */
var $c_Lexample_ReactApp$$anonfun$2 = (function() {
  $c_sr_AbstractFunction1.call(this)
});
$c_Lexample_ReactApp$$anonfun$2.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_ReactApp$$anonfun$2.prototype.constructor = $c_Lexample_ReactApp$$anonfun$2;
/** @constructor */
var $h_Lexample_ReactApp$$anonfun$2 = (function() {
  /*<skip>*/
});
$h_Lexample_ReactApp$$anonfun$2.prototype = $c_Lexample_ReactApp$$anonfun$2.prototype;
$c_Lexample_ReactApp$$anonfun$2.prototype.apply__O__O = (function(v1) {
  return this.apply__T2__Ljapgolly_scalajs_react_ReactElement($as_T2(v1))
});
$c_Lexample_ReactApp$$anonfun$2.prototype.example$ReactApp$$anonfun$$element$1__T__I__Lexample_ReactApp$Backend__Ljapgolly_scalajs_react_vdom_ReactTag = (function(name, index, b$1) {
  var jsx$2 = $m_Ljapgolly_scalajs_react_vdom_package$all$().li$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().class$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$1 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("navbar-brand", av);
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var $$this = $m_Ljapgolly_scalajs_react_vdom_package$all$().onClick$4;
  var callback = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(b$1$1, index$1) {
    return (function() {
      b$1$1.onMenuClick__I__V(index$1)
    })
  })(b$1, index));
  var v = (function(f) {
    return (function() {
      return f.apply__O()
    })
  })(callback);
  var ev = $m_Ljapgolly_scalajs_react_vdom_Implicits$().$$undreact$undattrJsFn$2;
  return jsx$2.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue($$this, v, ev), ($m_Ljapgolly_scalajs_react_vdom_package$all$(), new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(($m_Ljapgolly_scalajs_react_package$(), name)))]))
});
$c_Lexample_ReactApp$$anonfun$2.prototype.apply__T2__Ljapgolly_scalajs_react_ReactElement = (function(P) {
  if ((P !== null)) {
    var data = $as_sci_List(P.$$und1$f);
    var b = $as_Lexample_ReactApp$Backend(P.$$und2$f);
    var x$2_$_$$und1$f = data;
    var x$2_$_$$und2$f = b
  } else {
    var x$2_$_$$und1$f;
    var x$2_$_$$und2$f;
    throw new $c_s_MatchError().init___O(P)
  };
  var data$2 = $as_sci_List(x$2_$_$$und1$f);
  var b$2 = $as_Lexample_ReactApp$Backend(x$2_$_$$und2$f);
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var jsx$5 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().class$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$4 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("navbar navbar-default", av);
  var jsx$3 = $m_Ljapgolly_scalajs_react_vdom_package$all$().ul$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().class$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$1 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$2 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("navbar-header", av$1);
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var this$5 = $m_sci_List$();
  var bf = this$5.ReusableCBFInstance$2;
  var this$7 = $as_sci_List($s_sc_IterableLike$class__zipWithIndex__sc_IterableLike__scg_CanBuildFrom__O(data$2, bf));
  var f = (function(arg$outer, b$1) {
    return (function(x0$2$2) {
      var x0$2 = $as_T2(x0$2$2);
      if ((x0$2 !== null)) {
        var name = $as_T(x0$2.$$und1$f);
        var index = $uI(x0$2.$$und2$f);
        return arg$outer.example$ReactApp$$anonfun$$element$1__T__I__Lexample_ReactApp$Backend__Ljapgolly_scalajs_react_vdom_ReactTag(name, index, b$1)
      } else {
        throw new $c_s_MatchError().init___O(x0$2)
      }
    })
  })(this, b$2);
  var this$6 = $m_sci_List$();
  var bf$1 = this$6.ReusableCBFInstance$2;
  if ((bf$1 === $m_sci_List$().ReusableCBFInstance$2)) {
    if ((this$7 === $m_sci_Nil$())) {
      var jsx$1 = $m_sci_Nil$()
    } else {
      var arg1 = this$7.head__O();
      var h = new $c_sci_$colon$colon().init___O__sci_List(f(arg1), $m_sci_Nil$());
      var t = h;
      var rest = this$7.tail__sci_List();
      while ((rest !== $m_sci_Nil$())) {
        var arg1$1 = rest.head__O();
        var nx = new $c_sci_$colon$colon().init___O__sci_List(f(arg1$1), $m_sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$8 = rest;
        rest = this$8.tail__sci_List()
      };
      var jsx$1 = h
    }
  } else {
    var b$3 = $s_sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder(this$7, bf$1);
    var these = this$7;
    while ((!these.isEmpty__Z())) {
      var arg1$2 = these.head__O();
      b$3.$$plus$eq__O__scm_Builder(f(arg1$2));
      var this$9 = these;
      these = this$9.tail__sci_List()
    };
    var jsx$1 = b$3.result__O()
  };
  var xs = $as_sc_Seq(jsx$1);
  var evidence$5 = $m_s_Predef$().singleton$und$less$colon$less$2;
  var t$1 = jsx$5.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$4, jsx$3.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$2, new $c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode().init___sc_Seq__F1(xs, evidence$5)]))]));
  return t$1.render__Ljapgolly_scalajs_react_ReactElement()
});
var $d_Lexample_ReactApp$$anonfun$2 = new $TypeData().initClass({
  Lexample_ReactApp$$anonfun$2: 0
}, false, "example.ReactApp$$anonfun$2", {
  Lexample_ReactApp$$anonfun$2: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_ReactApp$$anonfun$2.prototype.$classData = $d_Lexample_ReactApp$$anonfun$2;
/** @constructor */
var $c_Lexample_ReactApp$$anonfun$3 = (function() {
  $c_sr_AbstractFunction1.call(this)
});
$c_Lexample_ReactApp$$anonfun$3.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_ReactApp$$anonfun$3.prototype.constructor = $c_Lexample_ReactApp$$anonfun$3;
/** @constructor */
var $h_Lexample_ReactApp$$anonfun$3 = (function() {
  /*<skip>*/
});
$h_Lexample_ReactApp$$anonfun$3.prototype = $c_Lexample_ReactApp$$anonfun$3.prototype;
$c_Lexample_ReactApp$$anonfun$3.prototype.apply__T__Ljapgolly_scalajs_react_ReactElement = (function(P) {
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var jsx$6 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().class$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$5 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("container", av);
  if ((P === "Home")) {
    $m_Ljapgolly_scalajs_react_vdom_package$all$();
    var this$3 = $m_Lexample_TimerExample$();
    var v = this$3.Timer$1.apply__sc_Seq__Ljapgolly_scalajs_react_ReactComponentU($m_sci_Nil$());
    var jsx$1 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(v)
  } else if ((P === "Documentation")) {
    var jsx$4 = $m_Ljapgolly_scalajs_react_vdom_package$all$().p$4;
    $m_Ljapgolly_scalajs_react_vdom_package$all$();
    var jsx$3 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(($m_Ljapgolly_scalajs_react_package$(), "Please see the "));
    var jsx$2 = $m_Ljapgolly_scalajs_react_vdom_package$all$().a$4;
    var this$8 = $m_Ljapgolly_scalajs_react_vdom_package$all$().href$4;
    $m_Ljapgolly_scalajs_react_vdom_package$all$();
    var ev = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
    var jsx$1 = jsx$4.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$3, jsx$2.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue(this$8, "https://github.com/japgolly/scalajs-react", ev), ($m_Ljapgolly_scalajs_react_vdom_package$all$(), new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(($m_Ljapgolly_scalajs_react_package$(), "project page^^")))])), ($m_Ljapgolly_scalajs_react_vdom_package$all$(), new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(($m_Ljapgolly_scalajs_react_package$(), ".")))]))
  } else {
    var jsx$1;
    throw new $c_s_MatchError().init___O(P)
  };
  var t = jsx$6.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$5, jsx$1]));
  return t.render__Ljapgolly_scalajs_react_ReactElement()
});
$c_Lexample_ReactApp$$anonfun$3.prototype.apply__O__O = (function(v1) {
  return this.apply__T__Ljapgolly_scalajs_react_ReactElement($as_T(v1))
});
var $d_Lexample_ReactApp$$anonfun$3 = new $TypeData().initClass({
  Lexample_ReactApp$$anonfun$3: 0
}, false, "example.ReactApp$$anonfun$3", {
  Lexample_ReactApp$$anonfun$3: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_ReactApp$$anonfun$3.prototype.$classData = $d_Lexample_ReactApp$$anonfun$3;
/** @constructor */
var $c_Lexample_ReactApp$Backend = (function() {
  $c_O.call(this);
  this.t$1 = null
});
$c_Lexample_ReactApp$Backend.prototype = new $h_O();
$c_Lexample_ReactApp$Backend.prototype.constructor = $c_Lexample_ReactApp$Backend;
/** @constructor */
var $h_Lexample_ReactApp$Backend = (function() {
  /*<skip>*/
});
$h_Lexample_ReactApp$Backend.prototype = $c_Lexample_ReactApp$Backend.prototype;
$c_Lexample_ReactApp$Backend.prototype.productPrefix__T = (function() {
  return "Backend"
});
$c_Lexample_ReactApp$Backend.prototype.init___Ljapgolly_scalajs_react_BackendScope = (function(t) {
  this.t$1 = t;
  return this
});
$c_Lexample_ReactApp$Backend.prototype.productArity__I = (function() {
  return 1
});
$c_Lexample_ReactApp$Backend.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lexample_ReactApp$Backend(x$1)) {
    var Backend$1 = $as_Lexample_ReactApp$Backend(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.t$1, Backend$1.t$1)
  } else {
    return false
  }
});
$c_Lexample_ReactApp$Backend.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.t$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lexample_ReactApp$Backend.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lexample_ReactApp$Backend.prototype.onMenuClick__I__V = (function(newIndex) {
  $m_Ljapgolly_scalajs_react_package$();
  var qual$1 = this.t$1;
  var C = $m_Ljapgolly_scalajs_react_CompStateAccess$SS$();
  var arg1 = C.state__Ljapgolly_scalajs_react_ComponentScope$undSS__O(qual$1);
  $as_Lexample_ReactApp$State(arg1);
  var s = new $c_Lexample_ReactApp$State().init___I(newIndex);
  C.setState__Ljapgolly_scalajs_react_ComponentScope$undSS__O__sjs_js_UndefOr__V(qual$1, s, (void 0))
});
$c_Lexample_ReactApp$Backend.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lexample_ReactApp$Backend.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_Lexample_ReactApp$Backend = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lexample_ReactApp$Backend)))
});
var $as_Lexample_ReactApp$Backend = (function(obj) {
  return (($is_Lexample_ReactApp$Backend(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "example.ReactApp$Backend"))
});
var $isArrayOf_Lexample_ReactApp$Backend = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lexample_ReactApp$Backend)))
});
var $asArrayOf_Lexample_ReactApp$Backend = (function(obj, depth) {
  return (($isArrayOf_Lexample_ReactApp$Backend(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lexample.ReactApp$Backend;", depth))
});
var $d_Lexample_ReactApp$Backend = new $TypeData().initClass({
  Lexample_ReactApp$Backend: 0
}, false, "example.ReactApp$Backend", {
  Lexample_ReactApp$Backend: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_ReactApp$Backend.prototype.$classData = $d_Lexample_ReactApp$Backend;
/** @constructor */
var $c_Lexample_ReactApp$State = (function() {
  $c_O.call(this);
  this.index$1 = 0
});
$c_Lexample_ReactApp$State.prototype = new $h_O();
$c_Lexample_ReactApp$State.prototype.constructor = $c_Lexample_ReactApp$State;
/** @constructor */
var $h_Lexample_ReactApp$State = (function() {
  /*<skip>*/
});
$h_Lexample_ReactApp$State.prototype = $c_Lexample_ReactApp$State.prototype;
$c_Lexample_ReactApp$State.prototype.productPrefix__T = (function() {
  return "State"
});
$c_Lexample_ReactApp$State.prototype.productArity__I = (function() {
  return 1
});
$c_Lexample_ReactApp$State.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lexample_ReactApp$State(x$1)) {
    var State$1 = $as_Lexample_ReactApp$State(x$1);
    return (this.index$1 === State$1.index$1)
  } else {
    return false
  }
});
$c_Lexample_ReactApp$State.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.index$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lexample_ReactApp$State.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lexample_ReactApp$State.prototype.init___I = (function(index) {
  this.index$1 = index;
  return this
});
$c_Lexample_ReactApp$State.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = $m_sr_Statics$().mix__I__I__I(acc, this.index$1);
  return $m_sr_Statics$().finalizeHash__I__I__I(acc, 1)
});
$c_Lexample_ReactApp$State.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_Lexample_ReactApp$State = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lexample_ReactApp$State)))
});
var $as_Lexample_ReactApp$State = (function(obj) {
  return (($is_Lexample_ReactApp$State(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "example.ReactApp$State"))
});
var $isArrayOf_Lexample_ReactApp$State = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lexample_ReactApp$State)))
});
var $asArrayOf_Lexample_ReactApp$State = (function(obj, depth) {
  return (($isArrayOf_Lexample_ReactApp$State(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lexample.ReactApp$State;", depth))
});
var $d_Lexample_ReactApp$State = new $TypeData().initClass({
  Lexample_ReactApp$State: 0
}, false, "example.ReactApp$State", {
  Lexample_ReactApp$State: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_ReactApp$State.prototype.$classData = $d_Lexample_ReactApp$State;
/** @constructor */
var $c_Lexample_TimerExample$$anonfun$16 = (function() {
  $c_sr_AbstractFunction1.call(this)
});
$c_Lexample_TimerExample$$anonfun$16.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_TimerExample$$anonfun$16.prototype.constructor = $c_Lexample_TimerExample$$anonfun$16;
/** @constructor */
var $h_Lexample_TimerExample$$anonfun$16 = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$$anonfun$16.prototype = $c_Lexample_TimerExample$$anonfun$16.prototype;
$c_Lexample_TimerExample$$anonfun$16.prototype.apply__O__O = (function(v1) {
  return this.apply__Ljapgolly_scalajs_react_ComponentScopeU__Ljapgolly_scalajs_react_ReactElement(v1)
});
$c_Lexample_TimerExample$$anonfun$16.prototype.apply__Ljapgolly_scalajs_react_ComponentScopeU__Ljapgolly_scalajs_react_ReactElement = (function(props) {
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var jsx$19 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$18 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("ui page grid", av);
  var jsx$17 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$1 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$16 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("column", av$1);
  var jsx$15 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$2 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$14 = jsx$15.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("ui large aligned header", av$2)]));
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var this$9 = $m_Lexample_TimerExample$().inputForm$1;
  var jsx$8 = $as_Lexample_TimerExample$State(($m_Ljapgolly_scalajs_react_package$(), props["state"]["v"])).text$1;
  var eta$0$1 = $as_Lexample_TimerExample$Backend(props["backend"]);
  var jsx$7 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(eta$0$1$1) {
    return (function(e$2) {
      eta$0$1$1.changeText__Ljapgolly_scalajs_react_SyntheticEvent__V(e$2)
    })
  })(eta$0$1));
  var eta$0$2 = $as_Lexample_TimerExample$Backend(props["backend"]);
  var props$1 = new $c_T3().init___O__O__O(jsx$8, jsx$7, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(eta$0$2$1) {
    return (function(e$2$1) {
      eta$0$2$1.doGetJsonV2__V()
    })
  })(eta$0$2)));
  var array = [];
  var jsx$12 = this$9.jsCtor$2;
  var jsx$11 = this$9.mkProps__O__Ljapgolly_scalajs_react_package$WrapObj(props$1);
  matchEnd5: {
    var jsx$10;
    var jsx$10 = array;
    break matchEnd5
  };
  var jsx$9 = [jsx$11]["concat"](jsx$10);
  var v = jsx$12["apply"]((void 0), jsx$9);
  var jsx$13 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(v);
  var jsx$6 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$3 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$5 = jsx$6.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("ui divider", av$3)]));
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var this$16 = $m_Lexample_TimerExample$().contentsList$1;
  var props$2 = $as_Lexample_TimerExample$State(($m_Ljapgolly_scalajs_react_package$(), props["state"]["v"])).contents$1;
  var array$1 = [];
  var jsx$4 = this$16.jsCtor$2;
  var jsx$3 = this$16.mkProps__O__Ljapgolly_scalajs_react_package$WrapObj(props$2);
  matchEnd5$1: {
    var jsx$2;
    var jsx$2 = array$1;
    break matchEnd5$1
  };
  var jsx$1 = [jsx$3]["concat"](jsx$2);
  var v$1 = jsx$4["apply"]((void 0), jsx$1);
  var t = jsx$19.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$18, jsx$17.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$16, jsx$14, jsx$13, jsx$5, new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(v$1)]))]));
  return t.render__Ljapgolly_scalajs_react_ReactElement()
});
var $d_Lexample_TimerExample$$anonfun$16 = new $TypeData().initClass({
  Lexample_TimerExample$$anonfun$16: 0
}, false, "example.TimerExample$$anonfun$16", {
  Lexample_TimerExample$$anonfun$16: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$$anonfun$16.prototype.$classData = $d_Lexample_TimerExample$$anonfun$16;
/** @constructor */
var $c_Lexample_TimerExample$$anonfun$18 = (function() {
  $c_sr_AbstractFunction1.call(this)
});
$c_Lexample_TimerExample$$anonfun$18.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_TimerExample$$anonfun$18.prototype.constructor = $c_Lexample_TimerExample$$anonfun$18;
/** @constructor */
var $h_Lexample_TimerExample$$anonfun$18 = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$$anonfun$18.prototype = $c_Lexample_TimerExample$$anonfun$18.prototype;
$c_Lexample_TimerExample$$anonfun$18.prototype.apply__O__O = (function(v1) {
  this.apply__Ljapgolly_scalajs_react_ComponentScopeM__V(v1)
});
$c_Lexample_TimerExample$$anonfun$18.prototype.apply__Ljapgolly_scalajs_react_ComponentScopeM__V = (function(x$7) {
  var $$this = $as_Lexample_TimerExample$Backend(x$7["backend"]).interval$1;
  if (($$this !== (void 0))) {
    $m_sjs_js_timers_package$().clearInterval__sjs_js_timers_SetIntervalHandle__V($$this)
  }
});
var $d_Lexample_TimerExample$$anonfun$18 = new $TypeData().initClass({
  Lexample_TimerExample$$anonfun$18: 0
}, false, "example.TimerExample$$anonfun$18", {
  Lexample_TimerExample$$anonfun$18: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$$anonfun$18.prototype.$classData = $d_Lexample_TimerExample$$anonfun$18;
/** @constructor */
var $c_Lexample_TimerExample$$anonfun$2 = (function() {
  $c_sr_AbstractFunction1.call(this)
});
$c_Lexample_TimerExample$$anonfun$2.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_TimerExample$$anonfun$2.prototype.constructor = $c_Lexample_TimerExample$$anonfun$2;
/** @constructor */
var $h_Lexample_TimerExample$$anonfun$2 = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$$anonfun$2.prototype = $c_Lexample_TimerExample$$anonfun$2.prototype;
$c_Lexample_TimerExample$$anonfun$2.prototype.apply__O__O = (function(v1) {
  return this.apply__T3__Ljapgolly_scalajs_react_ReactElement($as_T3(v1))
});
$c_Lexample_TimerExample$$anonfun$2.prototype.apply__T3__Ljapgolly_scalajs_react_ReactElement = (function(p) {
  if ((p !== null)) {
    var text = $as_T(p.$$und1$1);
    var change = $as_F1(p.$$und2$1);
    var click = $as_F1(p.$$und3$1);
    var x$2_$_$$und1$1 = text;
    var x$2_$_$$und2$1 = change;
    var x$2_$_$$und3$1 = click
  } else {
    var x$2_$_$$und1$1;
    var x$2_$_$$und2$1;
    var x$2_$_$$und3$1;
    throw new $c_s_MatchError().init___O(p)
  };
  var text$2 = $as_T(x$2_$_$$und1$1);
  var change$2 = $as_F1(x$2_$_$$und2$1);
  var click$2 = $as_F1(x$2_$_$$und3$1);
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var jsx$10 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$9 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("ui icon input", av);
  var jsx$8 = $m_Ljapgolly_scalajs_react_vdom_package$all$().form$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var $$this = $m_Ljapgolly_scalajs_react_vdom_package$all$().onSubmit$4;
  var v = (function(f) {
    return (function(arg1) {
      return f.apply__O__O(arg1)
    })
  })(click$2);
  var ev = $m_Ljapgolly_scalajs_react_vdom_Implicits$().$$undreact$undattrJsFn$2;
  var jsx$7 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue($$this, v, ev);
  var jsx$6 = $m_Ljapgolly_scalajs_react_vdom_package$all$().i$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$1 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$5 = jsx$6.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("circular search icon", av$1)]));
  var jsx$4 = $m_Ljapgolly_scalajs_react_vdom_package$all$().input$4;
  var this$8 = $m_Ljapgolly_scalajs_react_vdom_package$all$().type$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var ev$1 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$3 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue(this$8, "text", ev$1);
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var $$this$1 = $m_Ljapgolly_scalajs_react_vdom_package$all$().onChange$4;
  var v$1 = (function(f$1) {
    return (function(arg1$1) {
      return f$1.apply__O__O(arg1$1)
    })
  })(change$2);
  var ev$2 = $m_Ljapgolly_scalajs_react_vdom_Implicits$().$$undreact$undattrJsFn$2;
  var jsx$2 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue($$this$1, v$1, ev$2);
  var this$12 = $m_Ljapgolly_scalajs_react_vdom_package$all$().placeholder$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var ev$3 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$1 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue(this$12, "...", ev$3);
  var this$14 = $m_Ljapgolly_scalajs_react_vdom_package$all$().value$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var ev$4 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var t = jsx$10.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$9, jsx$8.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$7, jsx$5, jsx$4.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$3, jsx$2, jsx$1, new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue(this$14, text$2, ev$4)])), $m_Ljapgolly_scalajs_react_vdom_package$all$().button$4.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_package$all$(), new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(($m_Ljapgolly_scalajs_react_package$(), "do")))]))]))]));
  return t.render__Ljapgolly_scalajs_react_ReactElement()
});
var $d_Lexample_TimerExample$$anonfun$2 = new $TypeData().initClass({
  Lexample_TimerExample$$anonfun$2: 0
}, false, "example.TimerExample$$anonfun$2", {
  Lexample_TimerExample$$anonfun$2: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$$anonfun$2.prototype.$classData = $d_Lexample_TimerExample$$anonfun$2;
/** @constructor */
var $c_Lexample_TimerExample$$anonfun$3 = (function() {
  $c_sr_AbstractFunction1.call(this)
});
$c_Lexample_TimerExample$$anonfun$3.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_TimerExample$$anonfun$3.prototype.constructor = $c_Lexample_TimerExample$$anonfun$3;
/** @constructor */
var $h_Lexample_TimerExample$$anonfun$3 = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$$anonfun$3.prototype = $c_Lexample_TimerExample$$anonfun$3.prototype;
$c_Lexample_TimerExample$$anonfun$3.prototype.apply__O__O = (function(v1) {
  return this.apply__Lexample_TimerExample$Content__Ljapgolly_scalajs_react_ReactElement($as_Lexample_TimerExample$Content(v1))
});
$c_Lexample_TimerExample$$anonfun$3.prototype.apply__Lexample_TimerExample$Content__Ljapgolly_scalajs_react_ReactElement = (function(p) {
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var jsx$22 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$21 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("item", av);
  var jsx$20 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$1 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$19 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("image", av$1);
  var jsx$18 = $m_Ljapgolly_scalajs_react_vdom_package$all$().img$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$2 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$17 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("ui left small rounded image", av$2);
  var this$8 = $m_Ljapgolly_scalajs_react_vdom_package$all$().src$4;
  var v = p.imgsrc$1;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var ev = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$16 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue(this$8, v, ev);
  var this$10 = $m_Ljapgolly_scalajs_react_vdom_package$all$().title$4;
  var v$1 = p.title$1;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var ev$1 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$15 = jsx$20.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$19, jsx$18.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$17, jsx$16, new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue(this$10, v$1, ev$1)]))]));
  var jsx$14 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$3 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$13 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("content", av$3);
  var jsx$12 = $m_Ljapgolly_scalajs_react_vdom_package$all$().h2$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$4 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$11 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("teal header", av$4);
  var jsx$10 = $m_Ljapgolly_scalajs_react_vdom_package$all$().a$4;
  var this$16 = $m_Ljapgolly_scalajs_react_vdom_package$all$().href$4;
  var v$2 = p.link__T();
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var ev$2 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$9 = new $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair().init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue(this$16, v$2, ev$2);
  var this$17 = $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var html = p.title$1;
  var jsx$8 = jsx$12.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$11, jsx$10.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$9, $s_Ljapgolly_scalajs_react_vdom_Extra$Attrs$class__dangerouslySetInnerHtml__Ljapgolly_scalajs_react_vdom_Extra$Attrs__T__Ljapgolly_scalajs_react_vdom_TagMod(this$17, html)]))]));
  var jsx$7 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$5 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$6 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("meta", av$5);
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var v$3 = ((((p.serviceName__T() + " ") + p.tags$1) + " ") + p.startTime$1);
  var jsx$5 = jsx$7.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$6, new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(($m_Ljapgolly_scalajs_react_package$(), v$3))]));
  var jsx$4 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$6 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$3 = new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("description", av$6);
  var this$24 = $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var html$1 = p.description$1;
  var jsx$2 = jsx$4.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$3, $s_Ljapgolly_scalajs_react_vdom_Extra$Attrs$class__dangerouslySetInnerHtml__Ljapgolly_scalajs_react_vdom_Extra$Attrs__T__Ljapgolly_scalajs_react_vdom_TagMod(this$24, html$1)]));
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av$7 = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var t = jsx$22.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$21, jsx$15, jsx$14.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$13, jsx$8, jsx$5, jsx$2, jsx$1.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("extra", av$7)]))]))]));
  return t.render__Ljapgolly_scalajs_react_ReactElement()
});
var $d_Lexample_TimerExample$$anonfun$3 = new $TypeData().initClass({
  Lexample_TimerExample$$anonfun$3: 0
}, false, "example.TimerExample$$anonfun$3", {
  Lexample_TimerExample$$anonfun$3: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$$anonfun$3.prototype.$classData = $d_Lexample_TimerExample$$anonfun$3;
/** @constructor */
var $c_Lexample_TimerExample$$anonfun$4 = (function() {
  $c_sr_AbstractFunction1.call(this)
});
$c_Lexample_TimerExample$$anonfun$4.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_TimerExample$$anonfun$4.prototype.constructor = $c_Lexample_TimerExample$$anonfun$4;
/** @constructor */
var $h_Lexample_TimerExample$$anonfun$4 = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$$anonfun$4.prototype = $c_Lexample_TimerExample$$anonfun$4.prototype;
$c_Lexample_TimerExample$$anonfun$4.prototype.apply__O__O = (function(v1) {
  return this.apply__sci_List__Ljapgolly_scalajs_react_ReactElement($as_sci_List(v1))
});
$c_Lexample_TimerExample$$anonfun$4.prototype.apply__sci_List__Ljapgolly_scalajs_react_ReactElement = (function(list) {
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var jsx$7 = $m_Ljapgolly_scalajs_react_vdom_package$all$().div$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$().cls$4;
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var av = $m_Ljapgolly_scalajs_react_vdom_Scalatags$().stringAttrX$1;
  var jsx$6 = jsx$7.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_Ljapgolly_scalajs_react_vdom_ClassNameAttr$$anon$2().init___O__Ljapgolly_scalajs_react_vdom_AttrValue("ui items", av)]));
  $m_Ljapgolly_scalajs_react_vdom_package$all$();
  var f = (function(p$2) {
    var p = $as_Lexample_TimerExample$Content(p$2);
    var this$4 = $as_Ljapgolly_scalajs_react_ReactComponentC$ReqProps($m_Lexample_TimerExample$().container$1.withKey__sjs_js_Any__Ljapgolly_scalajs_react_ReactComponentC$BaseCtor(($m_Ljapgolly_scalajs_react_package$(), p.id$1)));
    var array = [];
    var jsx$4 = this$4.jsCtor$2;
    var jsx$3 = this$4.mkProps__O__Ljapgolly_scalajs_react_package$WrapObj(p);
    matchEnd5: {
      var jsx$2;
      var jsx$2 = array;
      break matchEnd5
    };
    var jsx$1 = [jsx$3]["concat"](jsx$2);
    return jsx$4["apply"]((void 0), jsx$1)
  });
  var this$6 = $m_sci_List$();
  var bf = this$6.ReusableCBFInstance$2;
  if ((bf === $m_sci_List$().ReusableCBFInstance$2)) {
    if ((list === $m_sci_Nil$())) {
      var jsx$5 = $m_sci_Nil$()
    } else {
      var arg1 = list.head__O();
      var h = new $c_sci_$colon$colon().init___O__sci_List(f(arg1), $m_sci_Nil$());
      var t = h;
      var rest = list.tail__sci_List();
      while ((rest !== $m_sci_Nil$())) {
        var arg1$1 = rest.head__O();
        var nx = new $c_sci_$colon$colon().init___O__sci_List(f(arg1$1), $m_sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$7 = rest;
        rest = this$7.tail__sci_List()
      };
      var jsx$5 = h
    }
  } else {
    var b = $s_sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder(list, bf);
    var these = list;
    while ((!these.isEmpty__Z())) {
      var arg1$2 = these.head__O();
      b.$$plus$eq__O__scm_Builder(f(arg1$2));
      var this$8 = these;
      these = this$8.tail__sci_List()
    };
    var jsx$5 = b.result__O()
  };
  var xs = $as_sc_Seq(jsx$5);
  var evidence$5 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(v$2) {
    $m_Ljapgolly_scalajs_react_vdom_package$all$();
    return new $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag().init___Ljapgolly_scalajs_react_ReactNode(v$2)
  }));
  var t$1 = jsx$6.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_Ljapgolly_scalajs_react_vdom_Scalatags$SeqNode().init___sc_Seq__F1(xs, evidence$5)]));
  return t$1.render__Ljapgolly_scalajs_react_ReactElement()
});
var $d_Lexample_TimerExample$$anonfun$4 = new $TypeData().initClass({
  Lexample_TimerExample$$anonfun$4: 0
}, false, "example.TimerExample$$anonfun$4", {
  Lexample_TimerExample$$anonfun$4: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$$anonfun$4.prototype.$classData = $d_Lexample_TimerExample$$anonfun$4;
/** @constructor */
var $c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1 = (function() {
  $c_sr_AbstractFunction1.call(this);
  this.$$outer$2 = null;
  this.urlBase$1$2 = null
});
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1.prototype.constructor = $c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1;
/** @constructor */
var $h_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1 = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1.prototype = $c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1.prototype;
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1.prototype.apply__O__O = (function(v1) {
  this.apply__T3__V($as_T3(v1))
});
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1.prototype.init___Lexample_TimerExample$Backend__T = (function($$outer, urlBase$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.urlBase$1$2 = urlBase$1;
  return this
});
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1.prototype.apply__T3__V = (function(ii) {
  if ((ii !== null)) {
    var s = $as_T(ii.$$und1$1);
    var joins = $as_sci_List(ii.$$und2$1);
    var sort = $as_T(ii.$$und3$1);
    var x$3_$_$$und1$1 = s;
    var x$3_$_$$und2$1 = joins;
    var x$3_$_$$und3$1 = sort
  } else {
    var x$3_$_$$und1$1;
    var x$3_$_$$und2$1;
    var x$3_$_$$und3$1;
    throw new $c_s_MatchError().init___O(ii)
  };
  var s$2 = $as_T(x$3_$_$$und1$1);
  var joins$2 = $as_sci_List(x$3_$_$$und2$1);
  var sort$2 = $as_T(x$3_$_$$und3$1);
  var this$5 = $m_Lorg_scalajs_dom_ext_Ajax$();
  var url = ((this.$$outer$2.example$TimerExample$Backend$$url$1__T__T__T(s$2, this.urlBase$1$2) + "?") + this.$$outer$2.example$TimerExample$Backend$$params$1__sci_List__T__T(joins$2, sort$2));
  var headers = $m_sci_Map$EmptyMap$();
  var this$6 = this$5.apply__T__T__Lorg_scalajs_dom_ext_Ajax$InputData__I__sci_Map__Z__T__s_concurrent_Future("GET", url, "", 0, headers, false, "");
  var f = new $c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5().init___Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1__T(this, s$2);
  var executor = $m_s_concurrent_ExecutionContext$Implicits$().global__s_concurrent_ExecutionContextExecutor();
  $s_s_concurrent_Future$class__foreach__s_concurrent_Future__F1__s_concurrent_ExecutionContext__V(this$6, f, executor)
});
var $d_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1 = new $TypeData().initClass({
  Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1: 0
}, false, "example.TimerExample$Backend$$anonfun$doGetJsonV2$1", {
  Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1.prototype.$classData = $d_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1;
/** @constructor */
var $c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5 = (function() {
  $c_sr_AbstractFunction1.call(this);
  this.$$outer$2 = null;
  this.s$1$f = null
});
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5.prototype = new $h_sr_AbstractFunction1();
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5.prototype.constructor = $c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5;
/** @constructor */
var $h_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5 = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5.prototype = $c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5.prototype;
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5.prototype.apply__O__O = (function(v1) {
  return this.apply__Lorg_scalajs_dom_raw_XMLHttpRequest__sci_List(v1)
});
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5.prototype.apply__Lorg_scalajs_dom_raw_XMLHttpRequest__sci_List = (function(x) {
  var values = $g["JSON"]["parse"]($as_T(x["responseText"]))["data"];
  var array = [];
  $uI(values["length"]);
  var i = 0;
  var len = $uI(values["length"]);
  while ((i < len)) {
    var index = i;
    var arg1 = values[index];
    var thumb = (((this.s$1$f === "live") && (arg1["communityIcon"] !== null)) ? $objectToString(arg1["communityIcon"]) : $objectToString(arg1["thumbnailUrl"]));
    var elem = new $c_Lexample_TimerExample$Content().init___T__T__T__T__T__T__T(this.s$1$f, $objectToString(arg1["contentId"]), thumb, $objectToString(arg1["tags"]), $objectToString(arg1["title"]), $objectToString(arg1["description"]), $objectToString(arg1["startTime"]));
    array["push"](elem);
    i = ((1 + i) | 0)
  };
  var this$4 = $m_sci_List$();
  var cbf = this$4.ReusableCBFInstance$2;
  var b = cbf.apply__scm_Builder();
  b.sizeHint__I__V($uI(array["length"]));
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(new $c_sjs_js_WrappedArray().init___sjs_js_Array(array));
  var list = $as_sci_List(b.result__O());
  $m_Ljapgolly_scalajs_react_package$();
  var qual$1 = this.$$outer$2.$$outer$2.example$TimerExample$Backend$$$$f;
  var C = $m_Ljapgolly_scalajs_react_CompStateAccess$SS$();
  var arg1$1 = C.state__Ljapgolly_scalajs_react_ComponentScope$undSS__O(qual$1);
  var st = $as_Lexample_TimerExample$State(arg1$1);
  var jsx$1 = st.contents$1;
  var this$10 = $m_sci_List$();
  var sorted = $as_sci_List(list.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O(jsx$1, this$10.ReusableCBFInstance$2));
  var s = new $c_Lexample_TimerExample$State().init___sci_List__T(sorted, "");
  C.setState__Ljapgolly_scalajs_react_ComponentScope$undSS__O__sjs_js_UndefOr__V(qual$1, s, (void 0));
  return list
});
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5.prototype.init___Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1__T = (function($$outer, s$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.s$1$f = s$1;
  return this
});
var $d_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5 = new $TypeData().initClass({
  Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5: 0
}, false, "example.TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5", {
  Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5.prototype.$classData = $d_Lexample_TimerExample$Backend$$anonfun$doGetJsonV2$1$$anonfun$apply$5;
/** @constructor */
var $c_Lexample_TimerExample$Content = (function() {
  $c_O.call(this);
  this.service$1 = null;
  this.id$1 = null;
  this.imgsrc$1 = null;
  this.tags$1 = null;
  this.title$1 = null;
  this.description$1 = null;
  this.startTime$1 = null
});
$c_Lexample_TimerExample$Content.prototype = new $h_O();
$c_Lexample_TimerExample$Content.prototype.constructor = $c_Lexample_TimerExample$Content;
/** @constructor */
var $h_Lexample_TimerExample$Content = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$Content.prototype = $c_Lexample_TimerExample$Content.prototype;
$c_Lexample_TimerExample$Content.prototype.productPrefix__T = (function() {
  return "Content"
});
$c_Lexample_TimerExample$Content.prototype.productArity__I = (function() {
  return 7
});
$c_Lexample_TimerExample$Content.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lexample_TimerExample$Content(x$1)) {
    var Content$1 = $as_Lexample_TimerExample$Content(x$1);
    return (((((((this.service$1 === Content$1.service$1) && (this.id$1 === Content$1.id$1)) && (this.imgsrc$1 === Content$1.imgsrc$1)) && (this.tags$1 === Content$1.tags$1)) && (this.title$1 === Content$1.title$1)) && (this.description$1 === Content$1.description$1)) && (this.startTime$1 === Content$1.startTime$1))
  } else {
    return false
  }
});
$c_Lexample_TimerExample$Content.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.service$1;
      break
    }
    case 1: {
      return this.id$1;
      break
    }
    case 2: {
      return this.imgsrc$1;
      break
    }
    case 3: {
      return this.tags$1;
      break
    }
    case 4: {
      return this.title$1;
      break
    }
    case 5: {
      return this.description$1;
      break
    }
    case 6: {
      return this.startTime$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lexample_TimerExample$Content.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lexample_TimerExample$Content.prototype.init___T__T__T__T__T__T__T = (function(service, id, imgsrc, tags, title, description, startTime) {
  this.service$1 = service;
  this.id$1 = id;
  this.imgsrc$1 = imgsrc;
  this.tags$1 = tags;
  this.title$1 = title;
  this.description$1 = description;
  this.startTime$1 = startTime;
  return this
});
$c_Lexample_TimerExample$Content.prototype.serviceName__T = (function() {
  var x1 = this.service$1;
  if ((x1 === "live")) {
    return "\u751f\u653e\u9001"
  } else if ((x1 === "video")) {
    return "\u52d5\u753b"
  } else if ((x1 === "illust")) {
    return "\u9759\u753b"
  } else if ((x1 === "news")) {
    return "\u30cb\u30e5\u30fc\u30b9"
  } else {
    throw new $c_s_MatchError().init___O(x1)
  }
});
$c_Lexample_TimerExample$Content.prototype.link__T = (function() {
  return ("http://nico.ms/" + this.id$1)
});
$c_Lexample_TimerExample$Content.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lexample_TimerExample$Content.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_Lexample_TimerExample$Content = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lexample_TimerExample$Content)))
});
var $as_Lexample_TimerExample$Content = (function(obj) {
  return (($is_Lexample_TimerExample$Content(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "example.TimerExample$Content"))
});
var $isArrayOf_Lexample_TimerExample$Content = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lexample_TimerExample$Content)))
});
var $asArrayOf_Lexample_TimerExample$Content = (function(obj, depth) {
  return (($isArrayOf_Lexample_TimerExample$Content(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lexample.TimerExample$Content;", depth))
});
var $d_Lexample_TimerExample$Content = new $TypeData().initClass({
  Lexample_TimerExample$Content: 0
}, false, "example.TimerExample$Content", {
  Lexample_TimerExample$Content: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$Content.prototype.$classData = $d_Lexample_TimerExample$Content;
/** @constructor */
var $c_Lexample_TimerExample$State = (function() {
  $c_O.call(this);
  this.contents$1 = null;
  this.text$1 = null
});
$c_Lexample_TimerExample$State.prototype = new $h_O();
$c_Lexample_TimerExample$State.prototype.constructor = $c_Lexample_TimerExample$State;
/** @constructor */
var $h_Lexample_TimerExample$State = (function() {
  /*<skip>*/
});
$h_Lexample_TimerExample$State.prototype = $c_Lexample_TimerExample$State.prototype;
$c_Lexample_TimerExample$State.prototype.productPrefix__T = (function() {
  return "State"
});
$c_Lexample_TimerExample$State.prototype.productArity__I = (function() {
  return 2
});
$c_Lexample_TimerExample$State.prototype.init___sci_List__T = (function(contents, text) {
  this.contents$1 = contents;
  this.text$1 = text;
  return this
});
$c_Lexample_TimerExample$State.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lexample_TimerExample$State(x$1)) {
    var State$1 = $as_Lexample_TimerExample$State(x$1);
    var x = this.contents$1;
    var x$2 = State$1.contents$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      return (this.text$1 === State$1.text$1)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Lexample_TimerExample$State.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.contents$1;
      break
    }
    case 1: {
      return this.text$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lexample_TimerExample$State.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lexample_TimerExample$State.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lexample_TimerExample$State.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_Lexample_TimerExample$State = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lexample_TimerExample$State)))
});
var $as_Lexample_TimerExample$State = (function(obj) {
  return (($is_Lexample_TimerExample$State(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "example.TimerExample$State"))
});
var $isArrayOf_Lexample_TimerExample$State = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lexample_TimerExample$State)))
});
var $asArrayOf_Lexample_TimerExample$State = (function(obj, depth) {
  return (($isArrayOf_Lexample_TimerExample$State(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lexample.TimerExample$State;", depth))
});
var $d_Lexample_TimerExample$State = new $TypeData().initClass({
  Lexample_TimerExample$State: 0
}, false, "example.TimerExample$State", {
  Lexample_TimerExample$State: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lexample_TimerExample$State.prototype.$classData = $d_Lexample_TimerExample$State;
var $is_Lexample_TimerExample$Tag = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lexample_TimerExample$Tag)))
});
var $as_Lexample_TimerExample$Tag = (function(obj) {
  return (($is_Lexample_TimerExample$Tag(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "example.TimerExample$Tag"))
});
var $isArrayOf_Lexample_TimerExample$Tag = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lexample_TimerExample$Tag)))
});
var $asArrayOf_Lexample_TimerExample$Tag = (function(obj, depth) {
  return (($isArrayOf_Lexample_TimerExample$Tag(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lexample.TimerExample$Tag;", depth))
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2 = (function() {
  $c_sr_AbstractFunction1.call(this);
  this.$$outer$2 = null;
  this.g$1$f = null
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2.prototype = new $h_sr_AbstractFunction1();
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2.prototype.constructor = $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2;
/** @constructor */
var $h_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2.prototype = $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2.prototype;
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2.prototype.apply__O__O = (function(v1) {
  var f = $as_F1(v1);
  return new $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3().init___Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2__F1(this, f)
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2.prototype.init___Ljapgolly_scalajs_react_Internal$FnComposer__F1 = (function($$outer, g$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.g$1$f = g$1;
  return this
});
var $d_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2: 0
}, false, "japgolly.scalajs.react.Internal$FnComposer$$anonfun$apply$2", {
  Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2.prototype.$classData = $d_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2;
/** @constructor */
var $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3 = (function() {
  $c_sr_AbstractFunction1.call(this);
  this.$$outer$2 = null;
  this.f$1$f = null
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3.prototype = new $h_sr_AbstractFunction1();
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3.prototype.constructor = $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3;
/** @constructor */
var $h_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3.prototype = $c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3.prototype;
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3.prototype.apply__O__O = (function(a) {
  return this.$$outer$2.$$outer$2.japgolly$scalajs$react$Internal$FnComposer$$m$f.apply__O__O(new $c_Ljapgolly_scalajs_react_Internal$FnResults().init___F0__F0(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(arg$outer, a$1) {
    return (function() {
      return arg$outer.f$1$f.apply__O__O(a$1)
    })
  })(this, a)), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(arg$outer$1, a$1$1) {
    return (function() {
      return arg$outer$1.$$outer$2.g$1$f.apply__O__O(a$1$1)
    })
  })(this, a))))
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3.prototype.init___Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2__F1 = (function($$outer, f$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.f$1$f = f$1;
  return this
});
var $d_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3: 0
}, false, "japgolly.scalajs.react.Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3", {
  Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3.prototype.$classData = $d_Ljapgolly_scalajs_react_Internal$FnComposer$$anonfun$apply$2$$anonfun$apply$3;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2 = (function() {
  $c_sr_AbstractFunction1.call(this);
  this.$$outer$2 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2.prototype = new $h_sr_AbstractFunction1();
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2.prototype.apply__O__O = (function(v1) {
  this.apply__Ljapgolly_scalajs_react_ComponentScopeU__V(v1)
});
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2.prototype.init___Ljapgolly_scalajs_react_ReactComponentB$Builder = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  return this
});
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2.prototype.apply__Ljapgolly_scalajs_react_ComponentScopeU__V = (function(t) {
  t["backend"] = this.$$outer$2.$$outer$1.japgolly$scalajs$react$ReactComponentB$$backF$f.apply__O__O(t);
  var $$this = this.$$outer$2.$$outer$1.japgolly$scalajs$react$ReactComponentB$$lc$f.componentWillMount$1;
  if (($$this !== (void 0))) {
    var g = $as_F1($$this);
    g.apply__O__O(t)
  }
});
var $d_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2: 0
}, false, "japgolly.scalajs.react.ReactComponentB$Builder$$anonfun$2", {
  Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB$Builder$$anonfun$2;
/** @constructor */
var $c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle = (function() {
  $c_O.call(this);
  this.configureSpec$1 = null;
  this.getDefaultProps$1 = null;
  this.componentWillMount$1 = null;
  this.componentDidMount$1 = null;
  this.componentWillUnmount$1 = null;
  this.componentWillUpdate$1 = null;
  this.componentDidUpdate$1 = null;
  this.componentWillReceiveProps$1 = null;
  this.shouldComponentUpdate$1 = null
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.constructor = $c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype = $c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype;
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.productPrefix__T = (function() {
  return "LifeCycle"
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.init___sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr = (function(configureSpec, getDefaultProps, componentWillMount, componentDidMount, componentWillUnmount, componentWillUpdate, componentDidUpdate, componentWillReceiveProps, shouldComponentUpdate) {
  this.configureSpec$1 = configureSpec;
  this.getDefaultProps$1 = getDefaultProps;
  this.componentWillMount$1 = componentWillMount;
  this.componentDidMount$1 = componentDidMount;
  this.componentWillUnmount$1 = componentWillUnmount;
  this.componentWillUpdate$1 = componentWillUpdate;
  this.componentDidUpdate$1 = componentDidUpdate;
  this.componentWillReceiveProps$1 = componentWillReceiveProps;
  this.shouldComponentUpdate$1 = shouldComponentUpdate;
  return this
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.productArity__I = (function() {
  return 9
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle(x$1)) {
    var LifeCycle$1 = $as_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle(x$1);
    return (((((((($m_sr_BoxesRunTime$().equals__O__O__Z(this.configureSpec$1, LifeCycle$1.configureSpec$1) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.getDefaultProps$1, LifeCycle$1.getDefaultProps$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.componentWillMount$1, LifeCycle$1.componentWillMount$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.componentDidMount$1, LifeCycle$1.componentDidMount$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.componentWillUnmount$1, LifeCycle$1.componentWillUnmount$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.componentWillUpdate$1, LifeCycle$1.componentWillUpdate$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.componentDidUpdate$1, LifeCycle$1.componentDidUpdate$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.componentWillReceiveProps$1, LifeCycle$1.componentWillReceiveProps$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.shouldComponentUpdate$1, LifeCycle$1.shouldComponentUpdate$1))
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.configureSpec$1;
      break
    }
    case 1: {
      return this.getDefaultProps$1;
      break
    }
    case 2: {
      return this.componentWillMount$1;
      break
    }
    case 3: {
      return this.componentDidMount$1;
      break
    }
    case 4: {
      return this.componentWillUnmount$1;
      break
    }
    case 5: {
      return this.componentWillUpdate$1;
      break
    }
    case 6: {
      return this.componentDidUpdate$1;
      break
    }
    case 7: {
      return this.componentWillReceiveProps$1;
      break
    }
    case 8: {
      return this.shouldComponentUpdate$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_ReactComponentB$LifeCycle)))
});
var $as_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.ReactComponentB$LifeCycle"))
});
var $isArrayOf_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_ReactComponentB$LifeCycle)))
});
var $asArrayOf_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.ReactComponentB$LifeCycle;", depth))
});
var $d_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_ReactComponentB$LifeCycle: 0
}, false, "japgolly.scalajs.react.ReactComponentB$LifeCycle", {
  Ljapgolly_scalajs_react_ReactComponentB$LifeCycle: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle.prototype.$classData = $d_Ljapgolly_scalajs_react_ReactComponentB$LifeCycle;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Attr = (function() {
  $c_O.call(this);
  this.name$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Attr = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Attr.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.productPrefix__T = (function() {
  return "Attr"
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_vdom_Attr(x$1)) {
    var Attr$1 = $as_Ljapgolly_scalajs_react_vdom_Attr(x$1);
    return (this.name$1 === Attr$1.name$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.name$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T = (function(name) {
  this.name$1 = name;
  $m_Ljapgolly_scalajs_react_vdom_Escaping$().assertValidAttrName__T__V(name);
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_Ljapgolly_scalajs_react_vdom_Attr = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_Attr)))
});
var $as_Ljapgolly_scalajs_react_vdom_Attr = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_Attr(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.Attr"))
});
var $isArrayOf_Ljapgolly_scalajs_react_vdom_Attr = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_Attr)))
});
var $asArrayOf_Ljapgolly_scalajs_react_vdom_Attr = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_Attr(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.Attr;", depth))
});
var $d_Ljapgolly_scalajs_react_vdom_Attr = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr: 0
}, false, "japgolly.scalajs.react.vdom.Attr", {
  Ljapgolly_scalajs_react_vdom_Attr: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Style = (function() {
  $c_O.call(this);
  this.jsName$1 = null;
  this.cssName$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Style;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Style = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Style.prototype = $c_Ljapgolly_scalajs_react_vdom_Style.prototype;
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.init___T__T = (function(jsName, cssName) {
  this.jsName$1 = jsName;
  this.cssName$1 = cssName;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.productPrefix__T = (function() {
  return "Style"
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.productArity__I = (function() {
  return 2
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_vdom_Style(x$1)) {
    var Style$1 = $as_Ljapgolly_scalajs_react_vdom_Style(x$1);
    return ((this.jsName$1 === Style$1.jsName$1) && (this.cssName$1 === Style$1.cssName$1))
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.jsName$1;
      break
    }
    case 1: {
      return this.cssName$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_Ljapgolly_scalajs_react_vdom_Style = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_Style)))
});
var $as_Ljapgolly_scalajs_react_vdom_Style = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_Style(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.Style"))
});
var $isArrayOf_Ljapgolly_scalajs_react_vdom_Style = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_Style)))
});
var $asArrayOf_Ljapgolly_scalajs_react_vdom_Style = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_Style(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.Style;", depth))
});
var $d_Ljapgolly_scalajs_react_vdom_Style = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Style: 0
}, false, "japgolly.scalajs.react.vdom.Style", {
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_Style.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Style;
/** @constructor */
var $c_jl_ArithmeticException = (function() {
  $c_jl_RuntimeException.call(this)
});
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
var $h_jl_ArithmeticException = (function() {
  /*<skip>*/
});
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
var $c_jl_ClassCastException = (function() {
  $c_jl_RuntimeException.call(this)
});
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
var $h_jl_ClassCastException = (function() {
  /*<skip>*/
});
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
var $is_jl_ClassCastException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
});
var $as_jl_ClassCastException = (function(obj) {
  return (($is_jl_ClassCastException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ClassCastException"))
});
var $isArrayOf_jl_ClassCastException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
});
var $asArrayOf_jl_ClassCastException = (function(obj, depth) {
  return (($isArrayOf_jl_ClassCastException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
});
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
var $c_jl_IllegalArgumentException = (function() {
  $c_jl_RuntimeException.call(this)
});
$c_jl_IllegalArgumentException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalArgumentException.prototype.constructor = $c_jl_IllegalArgumentException;
/** @constructor */
var $h_jl_IllegalArgumentException = (function() {
  /*<skip>*/
});
$h_jl_IllegalArgumentException.prototype = $c_jl_IllegalArgumentException.prototype;
$c_jl_IllegalArgumentException.prototype.init___ = (function() {
  $c_jl_IllegalArgumentException.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_jl_IllegalArgumentException.prototype.init___T = (function(s) {
  $c_jl_IllegalArgumentException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
/** @constructor */
var $c_jl_IllegalStateException = (function() {
  $c_jl_RuntimeException.call(this)
});
$c_jl_IllegalStateException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalStateException.prototype.constructor = $c_jl_IllegalStateException;
/** @constructor */
var $h_jl_IllegalStateException = (function() {
  /*<skip>*/
});
$h_jl_IllegalStateException.prototype = $c_jl_IllegalStateException.prototype;
$c_jl_IllegalStateException.prototype.init___T = (function(s) {
  $c_jl_IllegalStateException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalStateException = new $TypeData().initClass({
  jl_IllegalStateException: 0
}, false, "java.lang.IllegalStateException", {
  jl_IllegalStateException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalStateException.prototype.$classData = $d_jl_IllegalStateException;
/** @constructor */
var $c_jl_IndexOutOfBoundsException = (function() {
  $c_jl_RuntimeException.call(this)
});
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
var $h_jl_IndexOutOfBoundsException = (function() {
  /*<skip>*/
});
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
var $c_jl_NullPointerException = (function() {
  $c_jl_RuntimeException.call(this)
});
$c_jl_NullPointerException.prototype = new $h_jl_RuntimeException();
$c_jl_NullPointerException.prototype.constructor = $c_jl_NullPointerException;
/** @constructor */
var $h_jl_NullPointerException = (function() {
  /*<skip>*/
});
$h_jl_NullPointerException.prototype = $c_jl_NullPointerException.prototype;
$c_jl_NullPointerException.prototype.init___ = (function() {
  $c_jl_NullPointerException.prototype.init___T.call(this, null);
  return this
});
var $d_jl_NullPointerException = new $TypeData().initClass({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NullPointerException.prototype.$classData = $d_jl_NullPointerException;
/** @constructor */
var $c_jl_UnsupportedOperationException = (function() {
  $c_jl_RuntimeException.call(this)
});
$c_jl_UnsupportedOperationException.prototype = new $h_jl_RuntimeException();
$c_jl_UnsupportedOperationException.prototype.constructor = $c_jl_UnsupportedOperationException;
/** @constructor */
var $h_jl_UnsupportedOperationException = (function() {
  /*<skip>*/
});
$h_jl_UnsupportedOperationException.prototype = $c_jl_UnsupportedOperationException.prototype;
$c_jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  $c_jl_UnsupportedOperationException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_UnsupportedOperationException = new $TypeData().initClass({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_UnsupportedOperationException.prototype.$classData = $d_jl_UnsupportedOperationException;
/** @constructor */
var $c_ju_NoSuchElementException = (function() {
  $c_jl_RuntimeException.call(this)
});
$c_ju_NoSuchElementException.prototype = new $h_jl_RuntimeException();
$c_ju_NoSuchElementException.prototype.constructor = $c_ju_NoSuchElementException;
/** @constructor */
var $h_ju_NoSuchElementException = (function() {
  /*<skip>*/
});
$h_ju_NoSuchElementException.prototype = $c_ju_NoSuchElementException.prototype;
$c_ju_NoSuchElementException.prototype.init___ = (function() {
  $c_ju_NoSuchElementException.prototype.init___T.call(this, null);
  return this
});
var $d_ju_NoSuchElementException = new $TypeData().initClass({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_NoSuchElementException.prototype.$classData = $d_ju_NoSuchElementException;
/** @constructor */
var $c_s_MatchError = (function() {
  $c_jl_RuntimeException.call(this);
  this.obj$4 = null;
  this.objString$4 = null;
  this.bitmap$0$4 = false
});
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
var $h_s_MatchError = (function() {
  /*<skip>*/
});
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  return ("of class " + $objectGetClass(this.obj$4).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_RuntimeException.prototype.init___.call(this);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
var $c_s_Option = (function() {
  $c_O.call(this)
});
$c_s_Option.prototype = new $h_O();
$c_s_Option.prototype.constructor = $c_s_Option;
/** @constructor */
var $h_s_Option = (function() {
  /*<skip>*/
});
$h_s_Option.prototype = $c_s_Option.prototype;
$c_s_Option.prototype.init___ = (function() {
  return this
});
$c_s_Option.prototype.isDefined__Z = (function() {
  return (!this.isEmpty__Z())
});
/** @constructor */
var $c_s_Predef$$anon$1 = (function() {
  $c_s_Predef$$less$colon$less.call(this)
});
$c_s_Predef$$anon$1.prototype = new $h_s_Predef$$less$colon$less();
$c_s_Predef$$anon$1.prototype.constructor = $c_s_Predef$$anon$1;
/** @constructor */
var $h_s_Predef$$anon$1 = (function() {
  /*<skip>*/
});
$h_s_Predef$$anon$1.prototype = $c_s_Predef$$anon$1.prototype;
$c_s_Predef$$anon$1.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$1 = new $TypeData().initClass({
  s_Predef$$anon$1: 0
}, false, "scala.Predef$$anon$1", {
  s_Predef$$anon$1: 1,
  s_Predef$$less$colon$less: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$1.prototype.$classData = $d_s_Predef$$anon$1;
/** @constructor */
var $c_s_Predef$$anon$2 = (function() {
  $c_s_Predef$$eq$colon$eq.call(this)
});
$c_s_Predef$$anon$2.prototype = new $h_s_Predef$$eq$colon$eq();
$c_s_Predef$$anon$2.prototype.constructor = $c_s_Predef$$anon$2;
/** @constructor */
var $h_s_Predef$$anon$2 = (function() {
  /*<skip>*/
});
$h_s_Predef$$anon$2.prototype = $c_s_Predef$$anon$2.prototype;
$c_s_Predef$$anon$2.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$2 = new $TypeData().initClass({
  s_Predef$$anon$2: 0
}, false, "scala.Predef$$anon$2", {
  s_Predef$$anon$2: 1,
  s_Predef$$eq$colon$eq: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$2.prototype.$classData = $d_s_Predef$$anon$2;
/** @constructor */
var $c_s_StringContext = (function() {
  $c_O.call(this);
  this.parts$1 = null
});
$c_s_StringContext.prototype = new $h_O();
$c_s_StringContext.prototype.constructor = $c_s_StringContext;
/** @constructor */
var $h_s_StringContext = (function() {
  /*<skip>*/
});
$h_s_StringContext.prototype = $c_s_StringContext.prototype;
$c_s_StringContext.prototype.productPrefix__T = (function() {
  return "StringContext"
});
$c_s_StringContext.prototype.productArity__I = (function() {
  return 1
});
$c_s_StringContext.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_StringContext(x$1)) {
    var StringContext$1 = $as_s_StringContext(x$1);
    var x = this.parts$1;
    var x$2 = StringContext$1.parts$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_s_StringContext.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parts$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_StringContext.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_StringContext.prototype.checkLengths__sc_Seq__V = (function(args) {
  if ((this.parts$1.length__I() !== ((1 + args.length__I()) | 0))) {
    throw new $c_jl_IllegalArgumentException().init___T((((("wrong number of arguments (" + args.length__I()) + ") for interpolated string with ") + this.parts$1.length__I()) + " parts"))
  }
});
$c_s_StringContext.prototype.s__sc_Seq__T = (function(args) {
  var f = (function(this$2) {
    return (function(str$2) {
      var str = $as_T(str$2);
      var this$1 = $m_s_StringContext$();
      return this$1.treatEscapes0__p1__T__Z__T(str, false)
    })
  })(this);
  this.checkLengths__sc_Seq__V(args);
  var pi = this.parts$1.iterator__sc_Iterator();
  var ai = args.iterator__sc_Iterator();
  var arg1 = pi.next__O();
  var bldr = new $c_jl_StringBuilder().init___T($as_T(f(arg1)));
  while (ai.hasNext__Z()) {
    bldr.append__O__jl_StringBuilder(ai.next__O());
    var arg1$1 = pi.next__O();
    bldr.append__T__jl_StringBuilder($as_T(f(arg1$1)))
  };
  return bldr.content$1
});
$c_s_StringContext.prototype.init___sc_Seq = (function(parts) {
  this.parts$1 = parts;
  return this
});
$c_s_StringContext.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_StringContext.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_s_StringContext = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_StringContext)))
});
var $as_s_StringContext = (function(obj) {
  return (($is_s_StringContext(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.StringContext"))
});
var $isArrayOf_s_StringContext = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_StringContext)))
});
var $asArrayOf_s_StringContext = (function(obj, depth) {
  return (($isArrayOf_s_StringContext(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.StringContext;", depth))
});
var $d_s_StringContext = new $TypeData().initClass({
  s_StringContext: 0
}, false, "scala.StringContext", {
  s_StringContext: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext.prototype.$classData = $d_s_StringContext;
/** @constructor */
var $c_s_util_control_BreakControl = (function() {
  $c_jl_Throwable.call(this)
});
$c_s_util_control_BreakControl.prototype = new $h_jl_Throwable();
$c_s_util_control_BreakControl.prototype.constructor = $c_s_util_control_BreakControl;
/** @constructor */
var $h_s_util_control_BreakControl = (function() {
  /*<skip>*/
});
$h_s_util_control_BreakControl.prototype = $c_s_util_control_BreakControl.prototype;
$c_s_util_control_BreakControl.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___.call(this);
  return this
});
$c_s_util_control_BreakControl.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $s_s_util_control_NoStackTrace$class__fillInStackTrace__s_util_control_NoStackTrace__jl_Throwable(this)
});
$c_s_util_control_BreakControl.prototype.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
var $d_s_util_control_BreakControl = new $TypeData().initClass({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_s_util_control_BreakControl.prototype.$classData = $d_s_util_control_BreakControl;
var $is_sc_GenTraversable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
});
var $as_sc_GenTraversable = (function(obj) {
  return (($is_sc_GenTraversable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversable"))
});
var $isArrayOf_sc_GenTraversable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
});
var $asArrayOf_sc_GenTraversable = (function(obj, depth) {
  return (($isArrayOf_sc_GenTraversable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversable;", depth))
});
/** @constructor */
var $c_sc_Iterable$ = (function() {
  $c_scg_GenTraversableFactory.call(this)
});
$c_sc_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Iterable$.prototype.constructor = $c_sc_Iterable$;
/** @constructor */
var $h_sc_Iterable$ = (function() {
  /*<skip>*/
});
$h_sc_Iterable$.prototype = $c_sc_Iterable$.prototype;
$c_sc_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Iterable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Iterable$ = new $TypeData().initClass({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Iterable$.prototype.$classData = $d_sc_Iterable$;
var $n_sc_Iterable$ = (void 0);
var $m_sc_Iterable$ = (function() {
  if ((!$n_sc_Iterable$)) {
    $n_sc_Iterable$ = new $c_sc_Iterable$().init___()
  };
  return $n_sc_Iterable$
});
/** @constructor */
var $c_sc_Iterator$$anon$11 = (function() {
  $c_sc_AbstractIterator.call(this);
  this.$$outer$2 = null;
  this.f$3$2 = null
});
$c_sc_Iterator$$anon$11.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$11.prototype.constructor = $c_sc_Iterator$$anon$11;
/** @constructor */
var $h_sc_Iterator$$anon$11 = (function() {
  /*<skip>*/
});
$h_sc_Iterator$$anon$11.prototype = $c_sc_Iterator$$anon$11.prototype;
$c_sc_Iterator$$anon$11.prototype.next__O = (function() {
  return this.f$3$2.apply__O__O(this.$$outer$2.next__O())
});
$c_sc_Iterator$$anon$11.prototype.init___sc_Iterator__F1 = (function($$outer, f$3) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.f$3$2 = f$3;
  return this
});
$c_sc_Iterator$$anon$11.prototype.hasNext__Z = (function() {
  return this.$$outer$2.hasNext__Z()
});
var $d_sc_Iterator$$anon$11 = new $TypeData().initClass({
  sc_Iterator$$anon$11: 0
}, false, "scala.collection.Iterator$$anon$11", {
  sc_Iterator$$anon$11: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$11.prototype.$classData = $d_sc_Iterator$$anon$11;
/** @constructor */
var $c_sc_Iterator$$anon$2 = (function() {
  $c_sc_AbstractIterator.call(this)
});
$c_sc_Iterator$$anon$2.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$2.prototype.constructor = $c_sc_Iterator$$anon$2;
/** @constructor */
var $h_sc_Iterator$$anon$2 = (function() {
  /*<skip>*/
});
$h_sc_Iterator$$anon$2.prototype = $c_sc_Iterator$$anon$2.prototype;
$c_sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
$c_sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
});
$c_sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
var $d_sc_Iterator$$anon$2 = new $TypeData().initClass({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$2.prototype.$classData = $d_sc_Iterator$$anon$2;
/** @constructor */
var $c_sc_LinearSeqLike$$anon$1 = (function() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
});
$c_sc_LinearSeqLike$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sc_LinearSeqLike$$anon$1.prototype.constructor = $c_sc_LinearSeqLike$$anon$1;
/** @constructor */
var $h_sc_LinearSeqLike$$anon$1 = (function() {
  /*<skip>*/
});
$h_sc_LinearSeqLike$$anon$1.prototype = $c_sc_LinearSeqLike$$anon$1.prototype;
$c_sc_LinearSeqLike$$anon$1.prototype.init___sc_LinearSeqLike = (function($$outer) {
  this.these$2 = $$outer;
  return this
});
$c_sc_LinearSeqLike$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var result = this.these$2.head__O();
    this.these$2 = $as_sc_LinearSeqLike(this.these$2.tail__O());
    return result
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sc_LinearSeqLike$$anon$1.prototype.toList__sci_List = (function() {
  var xs = this.these$2.toList__sci_List();
  this.these$2 = $as_sc_LinearSeqLike(this.these$2.take__I__O(0));
  return xs
});
$c_sc_LinearSeqLike$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.these$2.isEmpty__Z())
});
var $d_sc_LinearSeqLike$$anon$1 = new $TypeData().initClass({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_LinearSeqLike$$anon$1.prototype.$classData = $d_sc_LinearSeqLike$$anon$1;
/** @constructor */
var $c_sc_Traversable$ = (function() {
  $c_scg_GenTraversableFactory.call(this);
  this.breaks$3 = null
});
$c_sc_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Traversable$.prototype.constructor = $c_sc_Traversable$;
/** @constructor */
var $h_sc_Traversable$ = (function() {
  /*<skip>*/
});
$h_sc_Traversable$.prototype = $c_sc_Traversable$.prototype;
$c_sc_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_Traversable$ = this;
  this.breaks$3 = new $c_s_util_control_Breaks().init___();
  return this
});
$c_sc_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Traversable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Traversable$ = new $TypeData().initClass({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Traversable$.prototype.$classData = $d_sc_Traversable$;
var $n_sc_Traversable$ = (void 0);
var $m_sc_Traversable$ = (function() {
  if ((!$n_sc_Traversable$)) {
    $n_sc_Traversable$ = new $c_sc_Traversable$().init___()
  };
  return $n_sc_Traversable$
});
/** @constructor */
var $c_scg_ImmutableSetFactory = (function() {
  $c_scg_SetFactory.call(this)
});
$c_scg_ImmutableSetFactory.prototype = new $h_scg_SetFactory();
$c_scg_ImmutableSetFactory.prototype.constructor = $c_scg_ImmutableSetFactory;
/** @constructor */
var $h_scg_ImmutableSetFactory = (function() {
  /*<skip>*/
});
$h_scg_ImmutableSetFactory.prototype = $c_scg_ImmutableSetFactory.prototype;
$c_scg_ImmutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.emptyInstance__sci_Set())
});
/** @constructor */
var $c_scg_MutableSetFactory = (function() {
  $c_scg_SetFactory.call(this)
});
$c_scg_MutableSetFactory.prototype = new $h_scg_SetFactory();
$c_scg_MutableSetFactory.prototype.constructor = $c_scg_MutableSetFactory;
/** @constructor */
var $h_scg_MutableSetFactory = (function() {
  /*<skip>*/
});
$h_scg_MutableSetFactory.prototype = $c_scg_MutableSetFactory.prototype;
$c_scg_MutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable($as_scg_Growable(this.empty__sc_GenTraversable()))
});
/** @constructor */
var $c_sci_Iterable$ = (function() {
  $c_scg_GenTraversableFactory.call(this)
});
$c_sci_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Iterable$.prototype.constructor = $c_sci_Iterable$;
/** @constructor */
var $h_sci_Iterable$ = (function() {
  /*<skip>*/
});
$h_sci_Iterable$.prototype = $c_sci_Iterable$.prototype;
$c_sci_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Iterable$ = new $TypeData().initClass({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Iterable$.prototype.$classData = $d_sci_Iterable$;
var $n_sci_Iterable$ = (void 0);
var $m_sci_Iterable$ = (function() {
  if ((!$n_sci_Iterable$)) {
    $n_sci_Iterable$ = new $c_sci_Iterable$().init___()
  };
  return $n_sci_Iterable$
});
/** @constructor */
var $c_sci_ListMap$$anon$1 = (function() {
  $c_sc_AbstractIterator.call(this);
  this.self$2 = null
});
$c_sci_ListMap$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sci_ListMap$$anon$1.prototype.constructor = $c_sci_ListMap$$anon$1;
/** @constructor */
var $h_sci_ListMap$$anon$1 = (function() {
  /*<skip>*/
});
$h_sci_ListMap$$anon$1.prototype = $c_sci_ListMap$$anon$1.prototype;
$c_sci_ListMap$$anon$1.prototype.next__O = (function() {
  return this.next__T2()
});
$c_sci_ListMap$$anon$1.prototype.init___sci_ListMap = (function($$outer) {
  this.self$2 = $$outer;
  return this
});
$c_sci_ListMap$$anon$1.prototype.next__T2 = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
  } else {
    var res = new $c_T2().init___O__O(this.self$2.key__O(), this.self$2.value__O());
    this.self$2 = this.self$2.next__sci_ListMap();
    return res
  }
});
$c_sci_ListMap$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.self$2.isEmpty__Z())
});
var $d_sci_ListMap$$anon$1 = new $TypeData().initClass({
  sci_ListMap$$anon$1: 0
}, false, "scala.collection.immutable.ListMap$$anon$1", {
  sci_ListMap$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_ListMap$$anon$1.prototype.$classData = $d_sci_ListMap$$anon$1;
/** @constructor */
var $c_sci_ListSet$$anon$1 = (function() {
  $c_sc_AbstractIterator.call(this);
  this.that$2 = null
});
$c_sci_ListSet$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sci_ListSet$$anon$1.prototype.constructor = $c_sci_ListSet$$anon$1;
/** @constructor */
var $h_sci_ListSet$$anon$1 = (function() {
  /*<skip>*/
});
$h_sci_ListSet$$anon$1.prototype = $c_sci_ListSet$$anon$1.prototype;
$c_sci_ListSet$$anon$1.prototype.next__O = (function() {
  var this$1 = this.that$2;
  if ($s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
    var res = this.that$2.head__O();
    this.that$2 = this.that$2.tail__sci_ListSet();
    return res
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sci_ListSet$$anon$1.prototype.init___sci_ListSet = (function($$outer) {
  this.that$2 = $$outer;
  return this
});
$c_sci_ListSet$$anon$1.prototype.hasNext__Z = (function() {
  var this$1 = this.that$2;
  return $s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
var $d_sci_ListSet$$anon$1 = new $TypeData().initClass({
  sci_ListSet$$anon$1: 0
}, false, "scala.collection.immutable.ListSet$$anon$1", {
  sci_ListSet$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_ListSet$$anon$1.prototype.$classData = $d_sci_ListSet$$anon$1;
/** @constructor */
var $c_sci_Stream$StreamBuilder = (function() {
  $c_scm_LazyBuilder.call(this)
});
$c_sci_Stream$StreamBuilder.prototype = new $h_scm_LazyBuilder();
$c_sci_Stream$StreamBuilder.prototype.constructor = $c_sci_Stream$StreamBuilder;
/** @constructor */
var $h_sci_Stream$StreamBuilder = (function() {
  /*<skip>*/
});
$h_sci_Stream$StreamBuilder.prototype = $c_sci_Stream$StreamBuilder.prototype;
$c_sci_Stream$StreamBuilder.prototype.result__O = (function() {
  return this.result__sci_Stream()
});
$c_sci_Stream$StreamBuilder.prototype.result__sci_Stream = (function() {
  var this$1 = this.parts$1;
  return $as_sci_Stream(this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(x$5$2) {
      var x$5 = $as_sc_TraversableOnce(x$5$2);
      return x$5.toStream__sci_Stream()
    })
  })(this)), ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___())))
});
var $is_sci_Stream$StreamBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
});
var $as_sci_Stream$StreamBuilder = (function(obj) {
  return (($is_sci_Stream$StreamBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$StreamBuilder"))
});
var $isArrayOf_sci_Stream$StreamBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
});
var $asArrayOf_sci_Stream$StreamBuilder = (function(obj, depth) {
  return (($isArrayOf_sci_Stream$StreamBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$StreamBuilder;", depth))
});
var $d_sci_Stream$StreamBuilder = new $TypeData().initClass({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_Stream$StreamBuilder.prototype.$classData = $d_sci_Stream$StreamBuilder;
/** @constructor */
var $c_sci_StreamIterator = (function() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
});
$c_sci_StreamIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_StreamIterator.prototype.constructor = $c_sci_StreamIterator;
/** @constructor */
var $h_sci_StreamIterator = (function() {
  /*<skip>*/
});
$h_sci_StreamIterator.prototype = $c_sci_StreamIterator.prototype;
$c_sci_StreamIterator.prototype.next__O = (function() {
  if ($s_sc_Iterator$class__isEmpty__sc_Iterator__Z(this)) {
    return $m_sc_Iterator$().empty$1.next__O()
  } else {
    var cur = this.these$2.v__sci_Stream();
    var result = cur.head__O();
    this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, cur$1) {
      return (function() {
        return $as_sci_Stream(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
$c_sci_StreamIterator.prototype.toList__sci_List = (function() {
  var this$1 = this.toStream__sci_Stream();
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  return $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(this$1, cbf))
});
$c_sci_StreamIterator.prototype.init___sci_Stream = (function(self) {
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, self$1) {
    return (function() {
      return self$1
    })
  })(this, self)));
  return this
});
$c_sci_StreamIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sci_Stream();
  return $s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
$c_sci_StreamIterator.prototype.toStream__sci_Stream = (function() {
  var result = this.these$2.v__sci_Stream();
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      $m_sci_Stream$();
      return $m_sci_Stream$Empty$()
    })
  })(this)));
  return result
});
var $d_sci_StreamIterator = new $TypeData().initClass({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_StreamIterator.prototype.$classData = $d_sci_StreamIterator;
/** @constructor */
var $c_sci_Traversable$ = (function() {
  $c_scg_GenTraversableFactory.call(this)
});
$c_sci_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Traversable$.prototype.constructor = $c_sci_Traversable$;
/** @constructor */
var $h_sci_Traversable$ = (function() {
  /*<skip>*/
});
$h_sci_Traversable$.prototype = $c_sci_Traversable$.prototype;
$c_sci_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Traversable$ = new $TypeData().initClass({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Traversable$.prototype.$classData = $d_sci_Traversable$;
var $n_sci_Traversable$ = (void 0);
var $m_sci_Traversable$ = (function() {
  if ((!$n_sci_Traversable$)) {
    $n_sci_Traversable$ = new $c_sci_Traversable$().init___()
  };
  return $n_sci_Traversable$
});
/** @constructor */
var $c_sci_TrieIterator = (function() {
  $c_sc_AbstractIterator.call(this);
  this.elems$2 = null;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = null;
  this.scala$collection$immutable$TrieIterator$$posStack$f = null;
  this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null
});
$c_sci_TrieIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_TrieIterator.prototype.constructor = $c_sci_TrieIterator;
/** @constructor */
var $h_sci_TrieIterator = (function() {
  /*<skip>*/
});
$h_sci_TrieIterator.prototype = $c_sci_TrieIterator.prototype;
$c_sci_TrieIterator.prototype.isContainer__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashMap1(x) || $is_sci_HashSet$HashSet1(x))
});
$c_sci_TrieIterator.prototype.next__O = (function() {
  if ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null)) {
    var el = this.scala$collection$immutable$TrieIterator$$subIter$f.next__O();
    if ((!this.scala$collection$immutable$TrieIterator$$subIter$f.hasNext__Z())) {
      this.scala$collection$immutable$TrieIterator$$subIter$f = null
    };
    return el
  } else {
    return this.next0__p2__Asci_Iterable__I__O(this.scala$collection$immutable$TrieIterator$$arrayD$f, this.scala$collection$immutable$TrieIterator$$posD$f)
  }
});
$c_sci_TrieIterator.prototype.initPosStack__AI = (function() {
  return $newArrayObject($d_I.getArrayOf(), [6])
});
$c_sci_TrieIterator.prototype.hasNext__Z = (function() {
  return ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null) || (this.scala$collection$immutable$TrieIterator$$depth$f >= 0))
});
$c_sci_TrieIterator.prototype.next0__p2__Asci_Iterable__I__O = (function(elems, i) {
  _next0: while (true) {
    if ((i === (((-1) + elems.u["length"]) | 0))) {
      this.scala$collection$immutable$TrieIterator$$depth$f = (((-1) + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
        this.scala$collection$immutable$TrieIterator$$posD$f = this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = null
      } else {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
        this.scala$collection$immutable$TrieIterator$$posD$f = 0
      }
    } else {
      this.scala$collection$immutable$TrieIterator$$posD$f = ((1 + this.scala$collection$immutable$TrieIterator$$posD$f) | 0)
    };
    var m = elems.u[i];
    if (this.isContainer__p2__O__Z(m)) {
      return this.getElem__O__O(m)
    } else if (this.isTrie__p2__O__Z(m)) {
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$arrayD$f;
        this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$posD$f
      };
      this.scala$collection$immutable$TrieIterator$$depth$f = ((1 + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      this.scala$collection$immutable$TrieIterator$$arrayD$f = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      this.scala$collection$immutable$TrieIterator$$posD$f = 0;
      var temp$elems = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      elems = temp$elems;
      i = 0;
      continue _next0
    } else {
      this.scala$collection$immutable$TrieIterator$$subIter$f = m.iterator__sc_Iterator();
      return this.next__O()
    }
  }
});
$c_sci_TrieIterator.prototype.getElems__p2__sci_Iterable__Asci_Iterable = (function(x) {
  if ($is_sci_HashMap$HashTrieMap(x)) {
    var x2 = $as_sci_HashMap$HashTrieMap(x);
    var jsx$1 = x2.elems$6
  } else if ($is_sci_HashSet$HashTrieSet(x)) {
    var x3 = $as_sci_HashSet$HashTrieSet(x);
    var jsx$1 = x3.elems$5
  } else {
    var jsx$1;
    throw new $c_s_MatchError().init___O(x)
  };
  return $asArrayOf_sci_Iterable(jsx$1, 1)
});
$c_sci_TrieIterator.prototype.init___Asci_Iterable = (function(elems) {
  this.elems$2 = elems;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = this.initArrayStack__AAsci_Iterable();
  this.scala$collection$immutable$TrieIterator$$posStack$f = this.initPosStack__AI();
  this.scala$collection$immutable$TrieIterator$$arrayD$f = this.elems$2;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null;
  return this
});
$c_sci_TrieIterator.prototype.isTrie__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashTrieMap(x) || $is_sci_HashSet$HashTrieSet(x))
});
$c_sci_TrieIterator.prototype.initArrayStack__AAsci_Iterable = (function() {
  return $newArrayObject($d_sci_Iterable.getArrayOf().getArrayOf(), [6])
});
/** @constructor */
var $c_sci_VectorBuilder = (function() {
  $c_O.call(this);
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  this.depth$1 = 0;
  this.display0$1 = null;
  this.display1$1 = null;
  this.display2$1 = null;
  this.display3$1 = null;
  this.display4$1 = null;
  this.display5$1 = null
});
$c_sci_VectorBuilder.prototype = new $h_O();
$c_sci_VectorBuilder.prototype.constructor = $c_sci_VectorBuilder;
/** @constructor */
var $h_sci_VectorBuilder = (function() {
  /*<skip>*/
});
$h_sci_VectorBuilder.prototype = $c_sci_VectorBuilder.prototype;
$c_sci_VectorBuilder.prototype.display3__AO = (function() {
  return this.display3$1
});
$c_sci_VectorBuilder.prototype.init___ = (function() {
  this.display0$1 = $newArrayObject($d_O.getArrayOf(), [32]);
  this.depth$1 = 1;
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  return this
});
$c_sci_VectorBuilder.prototype.depth__I = (function() {
  return this.depth$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$1 = x$1
});
$c_sci_VectorBuilder.prototype.display0__AO = (function() {
  return this.display0$1
});
$c_sci_VectorBuilder.prototype.display4__AO = (function() {
  return this.display4$1
});
$c_sci_VectorBuilder.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$1 = x$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__sci_VectorBuilder = (function(elem) {
  if ((this.lo$1 >= this.display0$1.u["length"])) {
    var newBlockIndex = ((32 + this.blockIndex$1) | 0);
    var xor = (this.blockIndex$1 ^ newBlockIndex);
    $s_sci_VectorPointer$class__gotoNextBlockStartWritable__sci_VectorPointer__I__I__V(this, newBlockIndex, xor);
    this.blockIndex$1 = newBlockIndex;
    this.lo$1 = 0
  };
  this.display0$1.u[this.lo$1] = elem;
  this.lo$1 = ((1 + this.lo$1) | 0);
  return this
});
$c_sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
$c_sci_VectorBuilder.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$1 = x$1
});
$c_sci_VectorBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sci_VectorBuilder.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$1 = x$1
});
$c_sci_VectorBuilder.prototype.display1__AO = (function() {
  return this.display1$1
});
$c_sci_VectorBuilder.prototype.display5__AO = (function() {
  return this.display5$1
});
$c_sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var size = ((this.blockIndex$1 + this.lo$1) | 0);
  if ((size === 0)) {
    var this$1 = $m_sci_Vector$();
    return this$1.NIL$6
  };
  var s = new $c_sci_Vector().init___I__I__I(0, size, 0);
  var depth = this.depth$1;
  $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  if ((this.depth$1 > 1)) {
    var xor = (((-1) + size) | 0);
    $s_sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V(s, 0, xor)
  };
  return s
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_VectorBuilder.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$1 = x$1
});
$c_sci_VectorBuilder.prototype.display2__AO = (function() {
  return this.display2$1
});
$c_sci_VectorBuilder.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$1 = x$1
});
$c_sci_VectorBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $as_sci_VectorBuilder($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
});
$c_sci_VectorBuilder.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$1 = x$1
});
var $is_sci_VectorBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
});
var $as_sci_VectorBuilder = (function(obj) {
  return (($is_sci_VectorBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
});
var $isArrayOf_sci_VectorBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
});
var $asArrayOf_sci_VectorBuilder = (function(obj, depth) {
  return (($isArrayOf_sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
});
var $d_sci_VectorBuilder = new $TypeData().initClass({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorBuilder.prototype.$classData = $d_sci_VectorBuilder;
/** @constructor */
var $c_scm_Builder$$anon$1 = (function() {
  $c_O.call(this);
  this.self$1 = null;
  this.f$1$1 = null
});
$c_scm_Builder$$anon$1.prototype = new $h_O();
$c_scm_Builder$$anon$1.prototype.constructor = $c_scm_Builder$$anon$1;
/** @constructor */
var $h_scm_Builder$$anon$1 = (function() {
  /*<skip>*/
});
$h_scm_Builder$$anon$1.prototype = $c_scm_Builder$$anon$1.prototype;
$c_scm_Builder$$anon$1.prototype.init___scm_Builder__F1 = (function($$outer, f$1) {
  this.f$1$1 = f$1;
  this.self$1 = $$outer;
  return this
});
$c_scm_Builder$$anon$1.prototype.equals__O__Z = (function(that) {
  return $s_s_Proxy$class__equals__s_Proxy__O__Z(this, that)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.toString__T = (function() {
  return $s_s_Proxy$class__toString__s_Proxy__T(this)
});
$c_scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1 = (function(xs) {
  this.self$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs);
  return this
});
$c_scm_Builder$$anon$1.prototype.result__O = (function() {
  return this.f$1$1.apply__O__O(this.self$1.result__O())
});
$c_scm_Builder$$anon$1.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundColl) {
  this.self$1.sizeHintBounded__I__sc_TraversableLike__V(size, boundColl)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder$$anon$1 = (function(x) {
  this.self$1.$$plus$eq__O__scm_Builder(x);
  return this
});
$c_scm_Builder$$anon$1.prototype.hashCode__I = (function() {
  return this.self$1.hashCode__I()
});
$c_scm_Builder$$anon$1.prototype.sizeHint__I__V = (function(size) {
  this.self$1.sizeHint__I__V(size)
});
$c_scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1(xs)
});
var $d_scm_Builder$$anon$1 = new $TypeData().initClass({
  scm_Builder$$anon$1: 0
}, false, "scala.collection.mutable.Builder$$anon$1", {
  scm_Builder$$anon$1: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Proxy: 1
});
$c_scm_Builder$$anon$1.prototype.$classData = $d_scm_Builder$$anon$1;
/** @constructor */
var $c_scm_FlatHashTable$$anon$1 = (function() {
  $c_sc_AbstractIterator.call(this);
  this.i$2 = 0;
  this.$$outer$2 = null
});
$c_scm_FlatHashTable$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_FlatHashTable$$anon$1.prototype.constructor = $c_scm_FlatHashTable$$anon$1;
/** @constructor */
var $h_scm_FlatHashTable$$anon$1 = (function() {
  /*<skip>*/
});
$h_scm_FlatHashTable$$anon$1.prototype = $c_scm_FlatHashTable$$anon$1.prototype;
$c_scm_FlatHashTable$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    this.i$2 = ((1 + this.i$2) | 0);
    var this$1 = this.$$outer$2;
    var entry = this.$$outer$2.table$5.u[(((-1) + this.i$2) | 0)];
    return $s_scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O(this$1, entry)
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_scm_FlatHashTable$$anon$1.prototype.init___scm_FlatHashTable = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.i$2 = 0;
  return this
});
$c_scm_FlatHashTable$$anon$1.prototype.hasNext__Z = (function() {
  while (((this.i$2 < this.$$outer$2.table$5.u["length"]) && (this.$$outer$2.table$5.u[this.i$2] === null))) {
    this.i$2 = ((1 + this.i$2) | 0)
  };
  return (this.i$2 < this.$$outer$2.table$5.u["length"])
});
var $d_scm_FlatHashTable$$anon$1 = new $TypeData().initClass({
  scm_FlatHashTable$$anon$1: 0
}, false, "scala.collection.mutable.FlatHashTable$$anon$1", {
  scm_FlatHashTable$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_FlatHashTable$$anon$1.prototype.$classData = $d_scm_FlatHashTable$$anon$1;
/** @constructor */
var $c_scm_ListBuffer$$anon$1 = (function() {
  $c_sc_AbstractIterator.call(this);
  this.cursor$2 = null
});
$c_scm_ListBuffer$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_ListBuffer$$anon$1.prototype.constructor = $c_scm_ListBuffer$$anon$1;
/** @constructor */
var $h_scm_ListBuffer$$anon$1 = (function() {
  /*<skip>*/
});
$h_scm_ListBuffer$$anon$1.prototype = $c_scm_ListBuffer$$anon$1.prototype;
$c_scm_ListBuffer$$anon$1.prototype.init___scm_ListBuffer = (function($$outer) {
  this.cursor$2 = ($$outer.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z() ? $m_sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
  return this
});
$c_scm_ListBuffer$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___T("next on empty Iterator")
  } else {
    var ans = this.cursor$2.head__O();
    var this$1 = this.cursor$2;
    this.cursor$2 = this$1.tail__sci_List();
    return ans
  }
});
$c_scm_ListBuffer$$anon$1.prototype.hasNext__Z = (function() {
  return (this.cursor$2 !== $m_sci_Nil$())
});
var $d_scm_ListBuffer$$anon$1 = new $TypeData().initClass({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_ListBuffer$$anon$1.prototype.$classData = $d_scm_ListBuffer$$anon$1;
var $is_sr_NonLocalReturnControl = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_NonLocalReturnControl)))
});
var $as_sr_NonLocalReturnControl = (function(obj) {
  return (($is_sr_NonLocalReturnControl(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.runtime.NonLocalReturnControl"))
});
var $isArrayOf_sr_NonLocalReturnControl = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_NonLocalReturnControl)))
});
var $asArrayOf_sr_NonLocalReturnControl = (function(obj, depth) {
  return (($isArrayOf_sr_NonLocalReturnControl(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.NonLocalReturnControl;", depth))
});
/** @constructor */
var $c_sr_ScalaRunTime$$anon$1 = (function() {
  $c_sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
});
$c_sr_ScalaRunTime$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sr_ScalaRunTime$$anon$1.prototype.constructor = $c_sr_ScalaRunTime$$anon$1;
/** @constructor */
var $h_sr_ScalaRunTime$$anon$1 = (function() {
  /*<skip>*/
});
$h_sr_ScalaRunTime$$anon$1.prototype = $c_sr_ScalaRunTime$$anon$1.prototype;
$c_sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
$c_sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
$c_sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
var $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sr_ScalaRunTime$$anon$1.prototype.$classData = $d_sr_ScalaRunTime$$anon$1;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$AutoStyle", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$AutoStyle;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$BorderRadius", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderRadius;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$BorderWidth", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderWidth;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$MultiImageStyle", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiImageStyle;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$MultiTimeStyle", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MultiTimeStyle;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$NoneOpenStyle", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NoneOpenStyle;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$NormalOpenStyle", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$NormalOpenStyle;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$OutlineStyle", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$Overflow", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$Overflow;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$PageBreak", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$PageBreak;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair = (function() {
  $c_O.call(this);
  this.a$1 = null;
  this.t$1 = null;
  this.av$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype = $c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype;
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.productPrefix__T = (function() {
  return "AttrPair"
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.productArity__I = (function() {
  return 3
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair(x$1)) {
    var AttrPair$1 = $as_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair(x$1);
    var x = this.a$1;
    var x$2 = AttrPair$1.a$1;
    if ((((x === null) ? (x$2 === null) : x.equals__O__Z(x$2)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.t$1, AttrPair$1.t$1))) {
      var x$3 = this.av$1;
      var x$4 = AttrPair$1.av$1;
      return (x$3 === x$4)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.a$1;
      break
    }
    case 1: {
      return this.t$1;
      break
    }
    case 2: {
      return this.av$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  var this$1 = this.av$1;
  var v = this.t$1;
  var arg1 = this$1.f$1.apply__O__O(v);
  b.addAttr__T__sjs_js_Any__V(this.a$1.name$1, arg1)
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.init___Ljapgolly_scalajs_react_vdom_Attr__O__Ljapgolly_scalajs_react_vdom_AttrValue = (function(a, t, av) {
  this.a$1 = a;
  this.t$1 = t;
  this.av$1 = av;
  return this
});
var $is_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair)))
});
var $as_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.Scalatags$AttrPair"))
});
var $isArrayOf_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair)))
});
var $asArrayOf_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.Scalatags$AttrPair;", depth))
});
var $d_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair: 0
}, false, "japgolly.scalajs.react.vdom.Scalatags$AttrPair", {
  Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Scalatags$AttrPair;
/** @constructor */
var $c_Ljava_io_PrintStream = (function() {
  $c_Ljava_io_FilterOutputStream.call(this);
  this.autoFlush$3 = false;
  this.charset$3 = null;
  this.encoder$3 = null;
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  this.bitmap$0$3 = false
});
$c_Ljava_io_PrintStream.prototype = new $h_Ljava_io_FilterOutputStream();
$c_Ljava_io_PrintStream.prototype.constructor = $c_Ljava_io_PrintStream;
/** @constructor */
var $h_Ljava_io_PrintStream = (function() {
  /*<skip>*/
});
$h_Ljava_io_PrintStream.prototype = $c_Ljava_io_PrintStream.prototype;
$c_Ljava_io_PrintStream.prototype.println__O__V = (function(obj) {
  this.print__O__V(obj);
  this.printString__p4__T__V("\n")
});
$c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset = (function(_out, autoFlush, charset) {
  this.autoFlush$3 = autoFlush;
  this.charset$3 = charset;
  $c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  return this
});
$c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  $c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
  return this
});
$c_Ljava_io_PrintStream.prototype.println__T__V = (function(s) {
  this.print__T__V(s);
  this.printString__p4__T__V("\n")
});
var $is_Ljava_io_PrintStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_PrintStream)))
});
var $as_Ljava_io_PrintStream = (function(obj) {
  return (($is_Ljava_io_PrintStream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.io.PrintStream"))
});
var $isArrayOf_Ljava_io_PrintStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_PrintStream)))
});
var $asArrayOf_Ljava_io_PrintStream = (function(obj, depth) {
  return (($isArrayOf_Ljava_io_PrintStream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.io.PrintStream;", depth))
});
/** @constructor */
var $c_T2 = (function() {
  $c_O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
});
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
var $h_T2 = (function() {
  /*<skip>*/
});
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
$c_T2.prototype.productArity__I = (function() {
  return 2
});
$c_T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_T2(x$1)) {
    var Tuple2$1 = $as_T2(x$1);
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$f, Tuple2$1.$$und1$f) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$f, Tuple2$1.$$und2$f))
  } else {
    return false
  }
});
$c_T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $s_s_Product2$class__productElement__s_Product2__I__O(this, n)
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
});
$c_T2.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_T2.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_T2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
});
var $as_T2 = (function(obj) {
  return (($is_T2(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple2"))
});
var $isArrayOf_T2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
});
var $asArrayOf_T2 = (function(obj, depth) {
  return (($isArrayOf_T2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple2;", depth))
});
var $d_T2 = new $TypeData().initClass({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T2.prototype.$classData = $d_T2;
/** @constructor */
var $c_T3 = (function() {
  $c_O.call(this);
  this.$$und1$1 = null;
  this.$$und2$1 = null;
  this.$$und3$1 = null
});
$c_T3.prototype = new $h_O();
$c_T3.prototype.constructor = $c_T3;
/** @constructor */
var $h_T3 = (function() {
  /*<skip>*/
});
$h_T3.prototype = $c_T3.prototype;
$c_T3.prototype.productPrefix__T = (function() {
  return "Tuple3"
});
$c_T3.prototype.productArity__I = (function() {
  return 3
});
$c_T3.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_T3(x$1)) {
    var Tuple3$1 = $as_T3(x$1);
    return (($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$1, Tuple3$1.$$und1$1) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$1, Tuple3$1.$$und2$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und3$1, Tuple3$1.$$und3$1))
  } else {
    return false
  }
});
$c_T3.prototype.productElement__I__O = (function(n) {
  return $s_s_Product3$class__productElement__s_Product3__I__O(this, n)
});
$c_T3.prototype.toString__T = (function() {
  return (((((("(" + this.$$und1$1) + ",") + this.$$und2$1) + ",") + this.$$und3$1) + ")")
});
$c_T3.prototype.init___O__O__O = (function(_1, _2, _3) {
  this.$$und1$1 = _1;
  this.$$und2$1 = _2;
  this.$$und3$1 = _3;
  return this
});
$c_T3.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_T3.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_T3 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T3)))
});
var $as_T3 = (function(obj) {
  return (($is_T3(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple3"))
});
var $isArrayOf_T3 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T3)))
});
var $asArrayOf_T3 = (function(obj, depth) {
  return (($isArrayOf_T3(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple3;", depth))
});
var $d_T3 = new $TypeData().initClass({
  T3: 0
}, false, "scala.Tuple3", {
  T3: 1,
  O: 1,
  s_Product3: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T3.prototype.$classData = $d_T3;
/** @constructor */
var $c_jl_NumberFormatException = (function() {
  $c_jl_IllegalArgumentException.call(this)
});
$c_jl_NumberFormatException.prototype = new $h_jl_IllegalArgumentException();
$c_jl_NumberFormatException.prototype.constructor = $c_jl_NumberFormatException;
/** @constructor */
var $h_jl_NumberFormatException = (function() {
  /*<skip>*/
});
$h_jl_NumberFormatException.prototype = $c_jl_NumberFormatException.prototype;
var $d_jl_NumberFormatException = new $TypeData().initClass({
  jl_NumberFormatException: 0
}, false, "java.lang.NumberFormatException", {
  jl_NumberFormatException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NumberFormatException.prototype.$classData = $d_jl_NumberFormatException;
/** @constructor */
var $c_s_None$ = (function() {
  $c_s_Option.call(this)
});
$c_s_None$.prototype = new $h_s_Option();
$c_s_None$.prototype.constructor = $c_s_None$;
/** @constructor */
var $h_s_None$ = (function() {
  /*<skip>*/
});
$h_s_None$.prototype = $c_s_None$.prototype;
$c_s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
$c_s_None$.prototype.productArity__I = (function() {
  return 0
});
$c_s_None$.prototype.isEmpty__Z = (function() {
  return true
});
$c_s_None$.prototype.get__O = (function() {
  this.get__sr_Nothing$()
});
$c_s_None$.prototype.productElement__I__O = (function(x$1) {
  matchEnd3: {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  }
});
$c_s_None$.prototype.toString__T = (function() {
  return "None"
});
$c_s_None$.prototype.get__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("None.get")
});
$c_s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
$c_s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_s_None$ = new $TypeData().initClass({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_None$.prototype.$classData = $d_s_None$;
var $n_s_None$ = (void 0);
var $m_s_None$ = (function() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$().init___()
  };
  return $n_s_None$
});
/** @constructor */
var $c_s_Some = (function() {
  $c_s_Option.call(this);
  this.x$2 = null
});
$c_s_Some.prototype = new $h_s_Option();
$c_s_Some.prototype.constructor = $c_s_Some;
/** @constructor */
var $h_s_Some = (function() {
  /*<skip>*/
});
$h_s_Some.prototype = $c_s_Some.prototype;
$c_s_Some.prototype.productPrefix__T = (function() {
  return "Some"
});
$c_s_Some.prototype.productArity__I = (function() {
  return 1
});
$c_s_Some.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_Some(x$1)) {
    var Some$1 = $as_s_Some(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.x$2, Some$1.x$2)
  } else {
    return false
  }
});
$c_s_Some.prototype.isEmpty__Z = (function() {
  return false
});
$c_s_Some.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.x$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_Some.prototype.get__O = (function() {
  return this.x$2
});
$c_s_Some.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_Some.prototype.init___O = (function(x) {
  this.x$2 = x;
  return this
});
$c_s_Some.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_Some.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_s_Some = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Some)))
});
var $as_s_Some = (function(obj) {
  return (($is_s_Some(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Some"))
});
var $isArrayOf_s_Some = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
});
var $asArrayOf_s_Some = (function(obj, depth) {
  return (($isArrayOf_s_Some(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Some;", depth))
});
var $d_s_Some = new $TypeData().initClass({
  s_Some: 0
}, false, "scala.Some", {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Some.prototype.$classData = $d_s_Some;
/** @constructor */
var $c_s_StringContext$InvalidEscapeException = (function() {
  $c_jl_IllegalArgumentException.call(this);
  this.index$5 = 0
});
$c_s_StringContext$InvalidEscapeException.prototype = new $h_jl_IllegalArgumentException();
$c_s_StringContext$InvalidEscapeException.prototype.constructor = $c_s_StringContext$InvalidEscapeException;
/** @constructor */
var $h_s_StringContext$InvalidEscapeException = (function() {
  /*<skip>*/
});
$h_s_StringContext$InvalidEscapeException.prototype = $c_s_StringContext$InvalidEscapeException.prototype;
$c_s_StringContext$InvalidEscapeException.prototype.init___T__I = (function(str, index) {
  this.index$5 = index;
  var jsx$3 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["invalid escape ", " index ", " in \"", "\". Use \\\\\\\\ for literal \\\\."]));
  $m_s_Predef$().require__Z__V(((index >= 0) && (index < $uI(str["length"]))));
  if ((index === (((-1) + $uI(str["length"])) | 0))) {
    var jsx$1 = "at terminal"
  } else {
    var jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["'\\\\", "' not one of ", " at"]));
    var index$1 = ((1 + index) | 0);
    var c = (65535 & $uI(str["charCodeAt"](index$1)));
    var jsx$1 = jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_jl_Character().init___C(c), "[\\b, \\t, \\n, \\f, \\r, \\\\, \\\", \\']"]))
  };
  $c_jl_IllegalArgumentException.prototype.init___T.call(this, jsx$3.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, index, str])));
  return this
});
var $d_s_StringContext$InvalidEscapeException = new $TypeData().initClass({
  s_StringContext$InvalidEscapeException: 0
}, false, "scala.StringContext$InvalidEscapeException", {
  s_StringContext$InvalidEscapeException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$InvalidEscapeException.prototype.$classData = $d_s_StringContext$InvalidEscapeException;
/** @constructor */
var $c_s_concurrent_impl_Promise$DefaultPromise = (function() {
  $c_s_concurrent_impl_AbstractPromise.call(this)
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype = new $h_s_concurrent_impl_AbstractPromise();
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.constructor = $c_s_concurrent_impl_Promise$DefaultPromise;
/** @constructor */
var $h_s_concurrent_impl_Promise$DefaultPromise = (function() {
  /*<skip>*/
});
$h_s_concurrent_impl_Promise$DefaultPromise.prototype = $c_s_concurrent_impl_Promise$DefaultPromise.prototype;
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.init___ = (function() {
  this.updateState__O__O__Z(null, $m_sci_Nil$());
  return this
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.dispatchOrAddCallback__p2__s_concurrent_impl_CallbackRunnable__V = (function(runnable) {
  var _$this = this;
  x: {
    _dispatchOrAddCallback: while (true) {
      var this$1 = _$this;
      var x1 = this$1.state$1;
      if ($is_s_util_Try(x1)) {
        var x2 = $as_s_util_Try(x1);
        runnable.executeWithValue__s_util_Try__V(x2)
      } else if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
        _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise();
        continue _dispatchOrAddCallback
      } else if ($is_sci_List(x1)) {
        var x4 = $as_sci_List(x1);
        if (_$this.updateState__O__O__Z(x4, new $c_sci_$colon$colon().init___O__sci_List(runnable, x4))) {
          /*<skip>*/
        } else {
          continue _dispatchOrAddCallback
        }
      } else {
        throw new $c_s_MatchError().init___O(x1)
      };
      break x
    }
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.tryComplete__s_util_Try__Z = (function(value) {
  var resolved = $m_s_concurrent_impl_Promise$().scala$concurrent$impl$Promise$$resolveTry__s_util_Try__s_util_Try(value);
  var x1 = this.tryCompleteAndGetListeners__p2__s_util_Try__sci_List(resolved);
  if ((x1 !== null)) {
    if (x1.isEmpty__Z()) {
      return true
    } else {
      var these = x1;
      while ((!these.isEmpty__Z())) {
        var arg1 = these.head__O();
        var r = $as_s_concurrent_impl_CallbackRunnable(arg1);
        r.executeWithValue__s_util_Try__V(resolved);
        var this$1 = these;
        these = this$1.tail__sci_List()
      };
      return true
    }
  } else {
    return false
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise = (function() {
  _compressedRoot: while (true) {
    var x1 = this.state$1;
    if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
      var x2 = $as_s_concurrent_impl_Promise$DefaultPromise(x1);
      var target = x2.root__p2__s_concurrent_impl_Promise$DefaultPromise();
      if ((x2 === target)) {
        return target
      } else if (this.updateState__O__O__Z(x2, target)) {
        return target
      } else {
        continue _compressedRoot
      }
    } else {
      return this
    }
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.root__p2__s_concurrent_impl_Promise$DefaultPromise = (function() {
  var _$this = this;
  _root: while (true) {
    var this$1 = _$this;
    var x1 = this$1.state$1;
    if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
      var x2 = $as_s_concurrent_impl_Promise$DefaultPromise(x1);
      _$this = x2;
      continue _root
    } else {
      return _$this
    }
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.tryCompleteAndGetListeners__p2__s_util_Try__sci_List = (function(v) {
  var _$this = this;
  _tryCompleteAndGetListeners: while (true) {
    var this$1 = _$this;
    var x1 = this$1.state$1;
    if ($is_sci_List(x1)) {
      var x2 = $as_sci_List(x1);
      if (_$this.updateState__O__O__Z(x2, v)) {
        return x2
      } else {
        continue _tryCompleteAndGetListeners
      }
    } else if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
      _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise();
      continue _tryCompleteAndGetListeners
    } else {
      return null
    }
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.onComplete__F1__s_concurrent_ExecutionContext__V = (function(func, executor) {
  var runnable = new $c_s_concurrent_impl_CallbackRunnable().init___s_concurrent_ExecutionContext__F1(executor, func);
  this.dispatchOrAddCallback__p2__s_concurrent_impl_CallbackRunnable__V(runnable)
});
var $is_s_concurrent_impl_Promise$DefaultPromise = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_impl_Promise$DefaultPromise)))
});
var $as_s_concurrent_impl_Promise$DefaultPromise = (function(obj) {
  return (($is_s_concurrent_impl_Promise$DefaultPromise(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.concurrent.impl.Promise$DefaultPromise"))
});
var $isArrayOf_s_concurrent_impl_Promise$DefaultPromise = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_impl_Promise$DefaultPromise)))
});
var $asArrayOf_s_concurrent_impl_Promise$DefaultPromise = (function(obj, depth) {
  return (($isArrayOf_s_concurrent_impl_Promise$DefaultPromise(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.concurrent.impl.Promise$DefaultPromise;", depth))
});
var $d_s_concurrent_impl_Promise$DefaultPromise = new $TypeData().initClass({
  s_concurrent_impl_Promise$DefaultPromise: 0
}, false, "scala.concurrent.impl.Promise$DefaultPromise", {
  s_concurrent_impl_Promise$DefaultPromise: 1,
  s_concurrent_impl_AbstractPromise: 1,
  O: 1,
  s_concurrent_impl_Promise: 1,
  s_concurrent_Promise: 1,
  s_concurrent_Future: 1,
  s_concurrent_Awaitable: 1
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.$classData = $d_s_concurrent_impl_Promise$DefaultPromise;
/** @constructor */
var $c_s_util_Failure = (function() {
  $c_s_util_Try.call(this);
  this.exception$2 = null
});
$c_s_util_Failure.prototype = new $h_s_util_Try();
$c_s_util_Failure.prototype.constructor = $c_s_util_Failure;
/** @constructor */
var $h_s_util_Failure = (function() {
  /*<skip>*/
});
$h_s_util_Failure.prototype = $c_s_util_Failure.prototype;
$c_s_util_Failure.prototype.productPrefix__T = (function() {
  return "Failure"
});
$c_s_util_Failure.prototype.productArity__I = (function() {
  return 1
});
$c_s_util_Failure.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_util_Failure(x$1)) {
    var Failure$1 = $as_s_util_Failure(x$1);
    var x = this.exception$2;
    var x$2 = Failure$1.exception$2;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_s_util_Failure.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_util_Failure.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_util_Failure.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_s_util_Failure.prototype.init___jl_Throwable = (function(exception) {
  this.exception$2 = exception;
  return this
});
$c_s_util_Failure.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_util_Failure.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_s_util_Failure = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Failure)))
});
var $as_s_util_Failure = (function(obj) {
  return (($is_s_util_Failure(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Failure"))
});
var $isArrayOf_s_util_Failure = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Failure)))
});
var $asArrayOf_s_util_Failure = (function(obj, depth) {
  return (($isArrayOf_s_util_Failure(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Failure;", depth))
});
var $d_s_util_Failure = new $TypeData().initClass({
  s_util_Failure: 0
}, false, "scala.util.Failure", {
  s_util_Failure: 1,
  s_util_Try: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Failure.prototype.$classData = $d_s_util_Failure;
/** @constructor */
var $c_s_util_Success = (function() {
  $c_s_util_Try.call(this);
  this.value$2 = null
});
$c_s_util_Success.prototype = new $h_s_util_Try();
$c_s_util_Success.prototype.constructor = $c_s_util_Success;
/** @constructor */
var $h_s_util_Success = (function() {
  /*<skip>*/
});
$h_s_util_Success.prototype = $c_s_util_Success.prototype;
$c_s_util_Success.prototype.productPrefix__T = (function() {
  return "Success"
});
$c_s_util_Success.prototype.productArity__I = (function() {
  return 1
});
$c_s_util_Success.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_util_Success(x$1)) {
    var Success$1 = $as_s_util_Success(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Success$1.value$2)
  } else {
    return false
  }
});
$c_s_util_Success.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_util_Success.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_util_Success.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.value$2)
});
$c_s_util_Success.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_util_Success.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_util_Success.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_s_util_Success = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Success)))
});
var $as_s_util_Success = (function(obj) {
  return (($is_s_util_Success(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Success"))
});
var $isArrayOf_s_util_Success = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Success)))
});
var $asArrayOf_s_util_Success = (function(obj, depth) {
  return (($isArrayOf_s_util_Success(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Success;", depth))
});
var $d_s_util_Success = new $TypeData().initClass({
  s_util_Success: 0
}, false, "scala.util.Success", {
  s_util_Success: 1,
  s_util_Try: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Success.prototype.$classData = $d_s_util_Success;
var $is_sc_TraversableLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableLike)))
});
var $as_sc_TraversableLike = (function(obj) {
  return (($is_sc_TraversableLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.TraversableLike"))
});
var $isArrayOf_sc_TraversableLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableLike)))
});
var $asArrayOf_sc_TraversableLike = (function(obj, depth) {
  return (($isArrayOf_sc_TraversableLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.TraversableLike;", depth))
});
/** @constructor */
var $c_scg_SeqFactory = (function() {
  $c_scg_GenSeqFactory.call(this)
});
$c_scg_SeqFactory.prototype = new $h_scg_GenSeqFactory();
$c_scg_SeqFactory.prototype.constructor = $c_scg_SeqFactory;
/** @constructor */
var $h_scg_SeqFactory = (function() {
  /*<skip>*/
});
$h_scg_SeqFactory.prototype = $c_scg_SeqFactory.prototype;
/** @constructor */
var $c_sci_HashMap$HashTrieMap$$anon$1 = (function() {
  $c_sci_TrieIterator.call(this)
});
$c_sci_HashMap$HashTrieMap$$anon$1.prototype = new $h_sci_TrieIterator();
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.constructor = $c_sci_HashMap$HashTrieMap$$anon$1;
/** @constructor */
var $h_sci_HashMap$HashTrieMap$$anon$1 = (function() {
  /*<skip>*/
});
$h_sci_HashMap$HashTrieMap$$anon$1.prototype = $c_sci_HashMap$HashTrieMap$$anon$1.prototype;
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.init___sci_HashMap$HashTrieMap = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$6);
  return this
});
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.getElem__O__O = (function(x) {
  return $as_sci_HashMap$HashMap1(x).ensurePair__T2()
});
var $d_sci_HashMap$HashTrieMap$$anon$1 = new $TypeData().initClass({
  sci_HashMap$HashTrieMap$$anon$1: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap$$anon$1", {
  sci_HashMap$HashTrieMap$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.$classData = $d_sci_HashMap$HashTrieMap$$anon$1;
/** @constructor */
var $c_sci_HashSet$HashTrieSet$$anon$1 = (function() {
  $c_sci_TrieIterator.call(this)
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype = new $h_sci_TrieIterator();
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.constructor = $c_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
var $h_sci_HashSet$HashTrieSet$$anon$1 = (function() {
  /*<skip>*/
});
$h_sci_HashSet$HashTrieSet$$anon$1.prototype = $c_sci_HashSet$HashTrieSet$$anon$1.prototype;
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.init___sci_HashSet$HashTrieSet = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$5);
  return this
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.getElem__O__O = (function(cc) {
  return $as_sci_HashSet$HashSet1(cc).key$6
});
var $d_sci_HashSet$HashTrieSet$$anon$1 = new $TypeData().initClass({
  sci_HashSet$HashTrieSet$$anon$1: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet$$anon$1", {
  sci_HashSet$HashTrieSet$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.$classData = $d_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
var $c_sci_Set$ = (function() {
  $c_scg_ImmutableSetFactory.call(this)
});
$c_sci_Set$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_Set$.prototype.constructor = $c_sci_Set$;
/** @constructor */
var $h_sci_Set$ = (function() {
  /*<skip>*/
});
$h_sci_Set$.prototype = $c_sci_Set$.prototype;
$c_sci_Set$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
var $d_sci_Set$ = new $TypeData().initClass({
  sci_Set$: 0
}, false, "scala.collection.immutable.Set$", {
  sci_Set$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Set$.prototype.$classData = $d_sci_Set$;
var $n_sci_Set$ = (void 0);
var $m_sci_Set$ = (function() {
  if ((!$n_sci_Set$)) {
    $n_sci_Set$ = new $c_sci_Set$().init___()
  };
  return $n_sci_Set$
});
/** @constructor */
var $c_sci_VectorIterator = (function() {
  $c_sc_AbstractIterator.call(this);
  this.endIndex$2 = 0;
  this.blockIndex$2 = 0;
  this.lo$2 = 0;
  this.endLo$2 = 0;
  this.$$undhasNext$2 = false;
  this.depth$2 = 0;
  this.display0$2 = null;
  this.display1$2 = null;
  this.display2$2 = null;
  this.display3$2 = null;
  this.display4$2 = null;
  this.display5$2 = null
});
$c_sci_VectorIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_VectorIterator.prototype.constructor = $c_sci_VectorIterator;
/** @constructor */
var $h_sci_VectorIterator = (function() {
  /*<skip>*/
});
$h_sci_VectorIterator.prototype = $c_sci_VectorIterator.prototype;
$c_sci_VectorIterator.prototype.next__O = (function() {
  if ((!this.$$undhasNext$2)) {
    throw new $c_ju_NoSuchElementException().init___T("reached iterator end")
  };
  var res = this.display0$2.u[this.lo$2];
  this.lo$2 = ((1 + this.lo$2) | 0);
  if ((this.lo$2 === this.endLo$2)) {
    if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
      var newBlockIndex = ((32 + this.blockIndex$2) | 0);
      var xor = (this.blockIndex$2 ^ newBlockIndex);
      $s_sci_VectorPointer$class__gotoNextBlockStart__sci_VectorPointer__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$2 = newBlockIndex;
      var x = ((this.endIndex$2 - this.blockIndex$2) | 0);
      this.endLo$2 = ((x < 32) ? x : 32);
      this.lo$2 = 0
    } else {
      this.$$undhasNext$2 = false
    }
  };
  return res
});
$c_sci_VectorIterator.prototype.display3__AO = (function() {
  return this.display3$2
});
$c_sci_VectorIterator.prototype.depth__I = (function() {
  return this.depth$2
});
$c_sci_VectorIterator.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$2 = x$1
});
$c_sci_VectorIterator.prototype.init___I__I = (function(_startIndex, endIndex) {
  this.endIndex$2 = endIndex;
  this.blockIndex$2 = ((-32) & _startIndex);
  this.lo$2 = (31 & _startIndex);
  var x = ((endIndex - this.blockIndex$2) | 0);
  this.endLo$2 = ((x < 32) ? x : 32);
  this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
  return this
});
$c_sci_VectorIterator.prototype.display0__AO = (function() {
  return this.display0$2
});
$c_sci_VectorIterator.prototype.display4__AO = (function() {
  return this.display4$2
});
$c_sci_VectorIterator.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$2 = x$1
});
$c_sci_VectorIterator.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$2 = x$1
});
$c_sci_VectorIterator.prototype.hasNext__Z = (function() {
  return this.$$undhasNext$2
});
$c_sci_VectorIterator.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$2 = x$1
});
$c_sci_VectorIterator.prototype.display1__AO = (function() {
  return this.display1$2
});
$c_sci_VectorIterator.prototype.display5__AO = (function() {
  return this.display5$2
});
$c_sci_VectorIterator.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$2 = x$1
});
$c_sci_VectorIterator.prototype.display2__AO = (function() {
  return this.display2$2
});
$c_sci_VectorIterator.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$2 = x$1
});
$c_sci_VectorIterator.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$2 = x$1
});
var $d_sci_VectorIterator = new $TypeData().initClass({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorIterator.prototype.$classData = $d_sci_VectorIterator;
/** @constructor */
var $c_sjsr_UndefinedBehaviorError = (function() {
  $c_jl_Error.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_Error();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
var $h_sjsr_UndefinedBehaviorError = (function() {
  /*<skip>*/
});
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  $c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
$c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Error.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1 = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1.prototype.init___Ljapgolly_scalajs_react_vdom_HtmlStyles = (function($$outer) {
  $c_Ljapgolly_scalajs_react_vdom_Style.prototype.init___T__T.call(this, "marginRight", "marginRight");
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStyles$$anon$1", {
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MarginAuto: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$1;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2 = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2.prototype.init___Ljapgolly_scalajs_react_vdom_HtmlStyles = (function($$outer) {
  $c_Ljapgolly_scalajs_react_vdom_Style.prototype.init___T__T.call(this, "marginTop", "marginTop");
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStyles$$anon$2", {
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MarginAuto: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$2;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3 = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3.prototype.init___Ljapgolly_scalajs_react_vdom_HtmlStyles = (function($$outer) {
  $c_Ljapgolly_scalajs_react_vdom_Style.prototype.init___T__T.call(this, "marginLeft", "marginLeft");
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStyles$$anon$3", {
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$MarginAuto: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$3;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4 = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this);
  this.$$outer$2 = null
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4.prototype.init___Ljapgolly_scalajs_react_vdom_HtmlStyles = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_Ljapgolly_scalajs_react_vdom_Style.prototype.init___T__T.call(this, "textAlignLast", "textAlignLast");
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStyles$$anon$4", {
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStyles$TextAlign: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$4;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5 = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Style.call(this);
  this.$$outer$2 = null
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5.prototype = new $h_Ljapgolly_scalajs_react_vdom_Style();
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5 = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5.prototype.init___Ljapgolly_scalajs_react_vdom_HtmlStyles = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_Ljapgolly_scalajs_react_vdom_Style.prototype.init___T__T.call(this, "textAlign", "textAlign");
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStyles$$anon$5", {
  Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStyles$TextAlign: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStyles$$anon$5;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle = (function() {
  $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle.call(this)
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle.prototype = new $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle();
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle.prototype;
var $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle: 0
}, false, "japgolly.scalajs.react.vdom.HtmlStylesMisc$BorderStyle", {
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$OutlineStyle: 1,
  Ljapgolly_scalajs_react_vdom_Style: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlStylesMisc$BorderStyle;
/** @constructor */
var $c_Lorg_scalajs_dom_ext_AjaxException = (function() {
  $c_jl_Exception.call(this);
  this.xhr$3 = null
});
$c_Lorg_scalajs_dom_ext_AjaxException.prototype = new $h_jl_Exception();
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.constructor = $c_Lorg_scalajs_dom_ext_AjaxException;
/** @constructor */
var $h_Lorg_scalajs_dom_ext_AjaxException = (function() {
  /*<skip>*/
});
$h_Lorg_scalajs_dom_ext_AjaxException.prototype = $c_Lorg_scalajs_dom_ext_AjaxException.prototype;
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.productPrefix__T = (function() {
  return "AjaxException"
});
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.productArity__I = (function() {
  return 1
});
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lorg_scalajs_dom_ext_AjaxException(x$1)) {
    var AjaxException$1 = $as_Lorg_scalajs_dom_ext_AjaxException(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.xhr$3, AjaxException$1.xhr$3)
  } else {
    return false
  }
});
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.xhr$3;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.init___Lorg_scalajs_dom_raw_XMLHttpRequest = (function(xhr) {
  this.xhr$3 = xhr;
  $c_jl_Exception.prototype.init___.call(this);
  return this
});
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_Lorg_scalajs_dom_ext_AjaxException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lorg_scalajs_dom_ext_AjaxException)))
});
var $as_Lorg_scalajs_dom_ext_AjaxException = (function(obj) {
  return (($is_Lorg_scalajs_dom_ext_AjaxException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "org.scalajs.dom.ext.AjaxException"))
});
var $isArrayOf_Lorg_scalajs_dom_ext_AjaxException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lorg_scalajs_dom_ext_AjaxException)))
});
var $asArrayOf_Lorg_scalajs_dom_ext_AjaxException = (function(obj, depth) {
  return (($isArrayOf_Lorg_scalajs_dom_ext_AjaxException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lorg.scalajs.dom.ext.AjaxException;", depth))
});
var $d_Lorg_scalajs_dom_ext_AjaxException = new $TypeData().initClass({
  Lorg_scalajs_dom_ext_AjaxException: 0
}, false, "org.scalajs.dom.ext.AjaxException", {
  Lorg_scalajs_dom_ext_AjaxException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_Lorg_scalajs_dom_ext_AjaxException.prototype.$classData = $d_Lorg_scalajs_dom_ext_AjaxException;
/** @constructor */
var $c_jl_JSConsoleBasedPrintStream = (function() {
  $c_Ljava_io_PrintStream.call(this);
  this.isErr$4 = null;
  this.flushed$4 = false;
  this.buffer$4 = null
});
$c_jl_JSConsoleBasedPrintStream.prototype = new $h_Ljava_io_PrintStream();
$c_jl_JSConsoleBasedPrintStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream;
/** @constructor */
var $h_jl_JSConsoleBasedPrintStream = (function() {
  /*<skip>*/
});
$h_jl_JSConsoleBasedPrintStream.prototype = $c_jl_JSConsoleBasedPrintStream.prototype;
$c_jl_JSConsoleBasedPrintStream.prototype.init___jl_Boolean = (function(isErr) {
  this.isErr$4 = isErr;
  $c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream.call(this, new $c_jl_JSConsoleBasedPrintStream$DummyOutputStream().init___());
  this.flushed$4 = true;
  this.buffer$4 = "";
  return this
});
$c_jl_JSConsoleBasedPrintStream.prototype.print__T__V = (function(s) {
  this.printString__p4__T__V(((s === null) ? "null" : s))
});
$c_jl_JSConsoleBasedPrintStream.prototype.doWriteLine__p4__T__V = (function(line) {
  var x = $g["console"];
  if ($uZ((!(!x)))) {
    var x$1 = this.isErr$4;
    if ($uZ(x$1)) {
      var x$2 = $g["console"]["error"];
      var jsx$1 = $uZ((!(!x$2)))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      $g["console"]["error"](line)
    } else {
      $g["console"]["log"](line)
    }
  }
});
$c_jl_JSConsoleBasedPrintStream.prototype.print__O__V = (function(obj) {
  this.printString__p4__T__V($m_sjsr_RuntimeString$().valueOf__O__T(obj))
});
$c_jl_JSConsoleBasedPrintStream.prototype.printString__p4__T__V = (function(s) {
  var rest = s;
  while ((rest !== "")) {
    var thiz = rest;
    var nlPos = $uI(thiz["indexOf"]("\n"));
    if ((nlPos < 0)) {
      this.buffer$4 = (("" + this.buffer$4) + rest);
      this.flushed$4 = false;
      rest = ""
    } else {
      var jsx$1 = this.buffer$4;
      var thiz$1 = rest;
      this.doWriteLine__p4__T__V((("" + jsx$1) + $as_T(thiz$1["substring"](0, nlPos))));
      this.buffer$4 = "";
      this.flushed$4 = true;
      var thiz$2 = rest;
      var beginIndex = ((1 + nlPos) | 0);
      rest = $as_T(thiz$2["substring"](beginIndex))
    }
  }
});
var $d_jl_JSConsoleBasedPrintStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
$c_jl_JSConsoleBasedPrintStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream;
/** @constructor */
var $c_sc_Seq$ = (function() {
  $c_scg_SeqFactory.call(this)
});
$c_sc_Seq$.prototype = new $h_scg_SeqFactory();
$c_sc_Seq$.prototype.constructor = $c_sc_Seq$;
/** @constructor */
var $h_sc_Seq$ = (function() {
  /*<skip>*/
});
$h_sc_Seq$.prototype = $c_sc_Seq$.prototype;
$c_sc_Seq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Seq$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Seq$ = new $TypeData().initClass({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Seq$.prototype.$classData = $d_sc_Seq$;
var $n_sc_Seq$ = (void 0);
var $m_sc_Seq$ = (function() {
  if ((!$n_sc_Seq$)) {
    $n_sc_Seq$ = new $c_sc_Seq$().init___()
  };
  return $n_sc_Seq$
});
/** @constructor */
var $c_scg_IndexedSeqFactory = (function() {
  $c_scg_SeqFactory.call(this)
});
$c_scg_IndexedSeqFactory.prototype = new $h_scg_SeqFactory();
$c_scg_IndexedSeqFactory.prototype.constructor = $c_scg_IndexedSeqFactory;
/** @constructor */
var $h_scg_IndexedSeqFactory = (function() {
  /*<skip>*/
});
$h_scg_IndexedSeqFactory.prototype = $c_scg_IndexedSeqFactory.prototype;
/** @constructor */
var $c_sci_HashMap$ = (function() {
  $c_scg_ImmutableMapFactory.call(this);
  this.defaultMerger$4 = null
});
$c_sci_HashMap$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_HashMap$.prototype.constructor = $c_sci_HashMap$;
/** @constructor */
var $h_sci_HashMap$ = (function() {
  /*<skip>*/
});
$h_sci_HashMap$.prototype = $c_sci_HashMap$.prototype;
$c_sci_HashMap$.prototype.init___ = (function() {
  $n_sci_HashMap$ = this;
  var mergef = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2) {
    return (function(a$2, b$2) {
      var a = $as_T2(a$2);
      $as_T2(b$2);
      return a
    })
  })(this));
  this.defaultMerger$4 = new $c_sci_HashMap$$anon$2().init___F2(mergef);
  return this
});
$c_sci_HashMap$.prototype.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap = (function(hash0, elem0, hash1, elem1, level, size) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashMap.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.u[0] = elem0;
      elems.u[1] = elem1
    } else {
      elems.u[0] = elem1;
      elems.u[1] = elem0
    };
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap, elems, size)
  } else {
    var elems$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    elems$2.u[0] = this.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(hash0, elem0, hash1, elem1, ((5 + level) | 0), size);
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap$2, elems$2, size)
  }
});
$c_sci_HashMap$.prototype.empty__sc_GenMap = (function() {
  return $m_sci_HashMap$EmptyHashMap$()
});
var $d_sci_HashMap$ = new $TypeData().initClass({
  sci_HashMap$: 0
}, false, "scala.collection.immutable.HashMap$", {
  sci_HashMap$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1,
  scg_BitOperations$Int: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashMap$.prototype.$classData = $d_sci_HashMap$;
var $n_sci_HashMap$ = (void 0);
var $m_sci_HashMap$ = (function() {
  if ((!$n_sci_HashMap$)) {
    $n_sci_HashMap$ = new $c_sci_HashMap$().init___()
  };
  return $n_sci_HashMap$
});
/** @constructor */
var $c_sci_Seq$ = (function() {
  $c_scg_SeqFactory.call(this)
});
$c_sci_Seq$.prototype = new $h_scg_SeqFactory();
$c_sci_Seq$.prototype.constructor = $c_sci_Seq$;
/** @constructor */
var $h_sci_Seq$ = (function() {
  /*<skip>*/
});
$h_sci_Seq$.prototype = $c_sci_Seq$.prototype;
$c_sci_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Seq$ = new $TypeData().initClass({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Seq$.prototype.$classData = $d_sci_Seq$;
var $n_sci_Seq$ = (void 0);
var $m_sci_Seq$ = (function() {
  if ((!$n_sci_Seq$)) {
    $n_sci_Seq$ = new $c_sci_Seq$().init___()
  };
  return $n_sci_Seq$
});
/** @constructor */
var $c_scm_IndexedSeq$ = (function() {
  $c_scg_SeqFactory.call(this)
});
$c_scm_IndexedSeq$.prototype = new $h_scg_SeqFactory();
$c_scm_IndexedSeq$.prototype.constructor = $c_scm_IndexedSeq$;
/** @constructor */
var $h_scm_IndexedSeq$ = (function() {
  /*<skip>*/
});
$h_scm_IndexedSeq$.prototype = $c_scm_IndexedSeq$.prototype;
$c_scm_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_IndexedSeq$ = new $TypeData().initClass({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_IndexedSeq$.prototype.$classData = $d_scm_IndexedSeq$;
var $n_scm_IndexedSeq$ = (void 0);
var $m_scm_IndexedSeq$ = (function() {
  if ((!$n_scm_IndexedSeq$)) {
    $n_scm_IndexedSeq$ = new $c_scm_IndexedSeq$().init___()
  };
  return $n_scm_IndexedSeq$
});
/** @constructor */
var $c_sjs_js_WrappedArray$ = (function() {
  $c_scg_SeqFactory.call(this)
});
$c_sjs_js_WrappedArray$.prototype = new $h_scg_SeqFactory();
$c_sjs_js_WrappedArray$.prototype.constructor = $c_sjs_js_WrappedArray$;
/** @constructor */
var $h_sjs_js_WrappedArray$ = (function() {
  /*<skip>*/
});
$h_sjs_js_WrappedArray$.prototype = $c_sjs_js_WrappedArray$.prototype;
$c_sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sjs_js_WrappedArray().init___()
});
var $d_sjs_js_WrappedArray$ = new $TypeData().initClass({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sjs_js_WrappedArray$.prototype.$classData = $d_sjs_js_WrappedArray$;
var $n_sjs_js_WrappedArray$ = (void 0);
var $m_sjs_js_WrappedArray$ = (function() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$().init___()
  };
  return $n_sjs_js_WrappedArray$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_ReactTag = (function() {
  $c_O.call(this);
  this.tag$1 = null;
  this.modifiers$1 = null;
  this.namespace$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_ReactTag;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_ReactTag = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_ReactTag.prototype = $c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype;
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.productPrefix__T = (function() {
  return "ReactTag"
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace = (function(tag, modifiers, namespace) {
  this.tag$1 = tag;
  this.modifiers$1 = modifiers;
  this.namespace$1 = namespace;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.productArity__I = (function() {
  return 3
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_vdom_ReactTag(x$1)) {
    var ReactTag$1 = $as_Ljapgolly_scalajs_react_vdom_ReactTag(x$1);
    if ((this.tag$1 === ReactTag$1.tag$1)) {
      var x = this.modifiers$1;
      var x$2 = ReactTag$1.modifiers$1;
      var jsx$1 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$3 = this.namespace$1;
      var x$4 = ReactTag$1.namespace$1;
      return (x$3 === x$4)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.tag$1;
      break
    }
    case 1: {
      return this.modifiers$1;
      break
    }
    case 2: {
      return this.namespace$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.toString__T = (function() {
  return $objectToString(this.render__Ljapgolly_scalajs_react_ReactElement())
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_ReactTag = (function(xs) {
  var tag = this.tag$1;
  var this$1 = this.modifiers$1;
  var modifiers = new $c_sci_$colon$colon().init___O__sci_List(xs, this$1);
  var namespace = this.namespace$1;
  return new $c_Ljapgolly_scalajs_react_vdom_ReactTag().init___T__sci_List__Ljapgolly_scalajs_react_vdom_Scalatags$Namespace(tag, modifiers, namespace)
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.render__Ljapgolly_scalajs_react_ReactElement = (function() {
  var b = new $c_Ljapgolly_scalajs_react_vdom_Builder().init___();
  this.build__p1__Ljapgolly_scalajs_react_vdom_Builder__V(b);
  return b.render__T__Ljapgolly_scalajs_react_ReactElement(this.tag$1)
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.build__p1__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  var current = this.modifiers$1;
  var this$1 = this.modifiers$1;
  var arr = $newArrayObject($d_sc_Seq.getArrayOf(), [$s_sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I(this$1)]);
  var i = 0;
  while (true) {
    var x = current;
    var x$2 = $m_sci_Nil$();
    if ((!((x === null) ? (x$2 === null) : x.equals__O__Z(x$2)))) {
      arr.u[i] = $as_sc_Seq(current.head__O());
      var this$2 = current;
      current = this$2.tail__sci_List();
      i = ((1 + i) | 0)
    } else {
      break
    }
  };
  var j = arr.u["length"];
  while ((j > 0)) {
    j = (((-1) + j) | 0);
    var frag = arr.u[j];
    var i$2 = 0;
    while ((i$2 < frag.length__I())) {
      $as_Ljapgolly_scalajs_react_vdom_TagMod(frag.apply__I__O(i$2)).applyTo__Ljapgolly_scalajs_react_vdom_Builder__V(b);
      i$2 = ((1 + i$2) | 0)
    }
  }
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  b.appendChild__Ljapgolly_scalajs_react_ReactNode__V(this.render__Ljapgolly_scalajs_react_ReactElement())
});
var $is_Ljapgolly_scalajs_react_vdom_ReactTag = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_ReactTag)))
});
var $as_Ljapgolly_scalajs_react_vdom_ReactTag = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_ReactTag(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.ReactTag"))
});
var $isArrayOf_Ljapgolly_scalajs_react_vdom_ReactTag = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_ReactTag)))
});
var $asArrayOf_Ljapgolly_scalajs_react_vdom_ReactTag = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_ReactTag(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.ReactTag;", depth))
});
var $d_Ljapgolly_scalajs_react_vdom_ReactTag = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_ReactTag: 0
}, false, "japgolly.scalajs.react.vdom.ReactTag", {
  Ljapgolly_scalajs_react_vdom_ReactTag: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Scalatags$DomFrag: 1,
  Ljapgolly_scalajs_react_vdom_Scalatags$Frag: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_ReactTag.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_ReactTag;
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag = (function() {
  $c_O.call(this);
  this.v$1 = null
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype = $c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype;
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.productPrefix__T = (function() {
  return "ReactNodeFrag"
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag(x$1)) {
    var ReactNodeFrag$1 = $as_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.v$1, ReactNodeFrag$1.v$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.v$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.init___Ljapgolly_scalajs_react_ReactNode = (function(v) {
  this.v$1 = v;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  b.appendChild__Ljapgolly_scalajs_react_ReactNode__V(this.v$1)
});
var $is_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag)))
});
var $as_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag = (function(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.Scalatags$ReactNodeFrag"))
});
var $isArrayOf_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag)))
});
var $asArrayOf_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag = (function(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.Scalatags$ReactNodeFrag;", depth))
});
var $d_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag: 0
}, false, "japgolly.scalajs.react.vdom.Scalatags$ReactNodeFrag", {
  Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Scalatags$DomFrag: 1,
  Ljapgolly_scalajs_react_vdom_Scalatags$Frag: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Scalatags$ReactNodeFrag;
/** @constructor */
var $c_s_reflect_AnyValManifest = (function() {
  $c_O.call(this);
  this.toString$1 = null;
  this.hashCode$1 = 0
});
$c_s_reflect_AnyValManifest.prototype = new $h_O();
$c_s_reflect_AnyValManifest.prototype.constructor = $c_s_reflect_AnyValManifest;
/** @constructor */
var $h_s_reflect_AnyValManifest = (function() {
  /*<skip>*/
});
$h_s_reflect_AnyValManifest.prototype = $c_s_reflect_AnyValManifest.prototype;
$c_s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.toString$1
});
$c_s_reflect_AnyValManifest.prototype.init___T = (function(toString) {
  this.toString$1 = toString;
  this.hashCode$1 = $systemIdentityHashCode(this);
  return this
});
$c_s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return this.hashCode$1
});
/** @constructor */
var $c_s_reflect_ManifestFactory$ClassTypeManifest = (function() {
  $c_O.call(this);
  this.prefix$1 = null;
  this.runtimeClass$1 = null;
  this.typeArguments$1 = null
});
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype = new $h_O();
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ClassTypeManifest;
/** @constructor */
var $h_s_reflect_ManifestFactory$ClassTypeManifest = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$ClassTypeManifest.prototype = $c_s_reflect_ManifestFactory$ClassTypeManifest.prototype;
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.init___s_Option__jl_Class__sci_List = (function(prefix, runtimeClass, typeArguments) {
  this.prefix$1 = prefix;
  this.runtimeClass$1 = runtimeClass;
  this.typeArguments$1 = typeArguments;
  return this
});
/** @constructor */
var $c_sc_IndexedSeq$ = (function() {
  $c_scg_IndexedSeqFactory.call(this);
  this.ReusableCBF$6 = null
});
$c_sc_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sc_IndexedSeq$.prototype.constructor = $c_sc_IndexedSeq$;
/** @constructor */
var $h_sc_IndexedSeq$ = (function() {
  /*<skip>*/
});
$h_sc_IndexedSeq$.prototype = $c_sc_IndexedSeq$.prototype;
$c_sc_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_IndexedSeqFactory.prototype.init___.call(this);
  $n_sc_IndexedSeq$ = this;
  this.ReusableCBF$6 = new $c_sc_IndexedSeq$$anon$1().init___();
  return this
});
$c_sc_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$ = new $TypeData().initClass({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_IndexedSeq$.prototype.$classData = $d_sc_IndexedSeq$;
var $n_sc_IndexedSeq$ = (void 0);
var $m_sc_IndexedSeq$ = (function() {
  if ((!$n_sc_IndexedSeq$)) {
    $n_sc_IndexedSeq$ = new $c_sc_IndexedSeq$().init___()
  };
  return $n_sc_IndexedSeq$
});
/** @constructor */
var $c_sc_IndexedSeqLike$Elements = (function() {
  $c_sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$f = null
});
$c_sc_IndexedSeqLike$Elements.prototype = new $h_sc_AbstractIterator();
$c_sc_IndexedSeqLike$Elements.prototype.constructor = $c_sc_IndexedSeqLike$Elements;
/** @constructor */
var $h_sc_IndexedSeqLike$Elements = (function() {
  /*<skip>*/
});
$h_sc_IndexedSeqLike$Elements.prototype = $c_sc_IndexedSeqLike$Elements.prototype;
$c_sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    $m_sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$f.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
$c_sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  this.index$2 = start;
  return this
});
$c_sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
var $d_sc_IndexedSeqLike$Elements = new $TypeData().initClass({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sc_IndexedSeqLike$Elements.prototype.$classData = $d_sc_IndexedSeqLike$Elements;
/** @constructor */
var $c_sci_HashSet$ = (function() {
  $c_scg_ImmutableSetFactory.call(this)
});
$c_sci_HashSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_HashSet$.prototype.constructor = $c_sci_HashSet$;
/** @constructor */
var $h_sci_HashSet$ = (function() {
  /*<skip>*/
});
$h_sci_HashSet$.prototype = $c_sci_HashSet$.prototype;
$c_sci_HashSet$.prototype.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet = (function(hash0, elem0, hash1, elem1, level) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashSet.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.u[0] = elem0;
      elems.u[1] = elem1
    } else {
      elems.u[0] = elem1;
      elems.u[1] = elem0
    };
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap, elems, ((elem0.size__I() + elem1.size__I()) | 0))
  } else {
    var elems$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    var child = this.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, ((5 + level) | 0));
    elems$2.u[0] = child;
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap$2, elems$2, child.size0$5)
  }
});
$c_sci_HashSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
var $d_sci_HashSet$ = new $TypeData().initClass({
  sci_HashSet$: 0
}, false, "scala.collection.immutable.HashSet$", {
  sci_HashSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$.prototype.$classData = $d_sci_HashSet$;
var $n_sci_HashSet$ = (void 0);
var $m_sci_HashSet$ = (function() {
  if ((!$n_sci_HashSet$)) {
    $n_sci_HashSet$ = new $c_sci_HashSet$().init___()
  };
  return $n_sci_HashSet$
});
/** @constructor */
var $c_sci_IndexedSeq$ = (function() {
  $c_scg_IndexedSeqFactory.call(this)
});
$c_sci_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_IndexedSeq$.prototype.constructor = $c_sci_IndexedSeq$;
/** @constructor */
var $h_sci_IndexedSeq$ = (function() {
  /*<skip>*/
});
$h_sci_IndexedSeq$.prototype = $c_sci_IndexedSeq$.prototype;
$c_sci_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_IndexedSeq$ = new $TypeData().initClass({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_IndexedSeq$.prototype.$classData = $d_sci_IndexedSeq$;
var $n_sci_IndexedSeq$ = (void 0);
var $m_sci_IndexedSeq$ = (function() {
  if ((!$n_sci_IndexedSeq$)) {
    $n_sci_IndexedSeq$ = new $c_sci_IndexedSeq$().init___()
  };
  return $n_sci_IndexedSeq$
});
/** @constructor */
var $c_sci_ListSet$ = (function() {
  $c_scg_ImmutableSetFactory.call(this)
});
$c_sci_ListSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_ListSet$.prototype.constructor = $c_sci_ListSet$;
/** @constructor */
var $h_sci_ListSet$ = (function() {
  /*<skip>*/
});
$h_sci_ListSet$.prototype = $c_sci_ListSet$.prototype;
$c_sci_ListSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
$c_sci_ListSet$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_ListSet$ListSetBuilder().init___()
});
var $d_sci_ListSet$ = new $TypeData().initClass({
  sci_ListSet$: 0
}, false, "scala.collection.immutable.ListSet$", {
  sci_ListSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$.prototype.$classData = $d_sci_ListSet$;
var $n_sci_ListSet$ = (void 0);
var $m_sci_ListSet$ = (function() {
  if ((!$n_sci_ListSet$)) {
    $n_sci_ListSet$ = new $c_sci_ListSet$().init___()
  };
  return $n_sci_ListSet$
});
/** @constructor */
var $c_scm_HashSet$ = (function() {
  $c_scg_MutableSetFactory.call(this)
});
$c_scm_HashSet$.prototype = new $h_scg_MutableSetFactory();
$c_scm_HashSet$.prototype.constructor = $c_scm_HashSet$;
/** @constructor */
var $h_scm_HashSet$ = (function() {
  /*<skip>*/
});
$h_scm_HashSet$.prototype = $c_scm_HashSet$.prototype;
$c_scm_HashSet$.prototype.empty__sc_GenTraversable = (function() {
  return new $c_scm_HashSet().init___()
});
var $d_scm_HashSet$ = new $TypeData().initClass({
  scm_HashSet$: 0
}, false, "scala.collection.mutable.HashSet$", {
  scm_HashSet$: 1,
  scg_MutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_HashSet$.prototype.$classData = $d_scm_HashSet$;
var $n_scm_HashSet$ = (void 0);
var $m_scm_HashSet$ = (function() {
  if ((!$n_scm_HashSet$)) {
    $n_scm_HashSet$ = new $c_scm_HashSet$().init___()
  };
  return $n_scm_HashSet$
});
/** @constructor */
var $c_sjs_js_JavaScriptException = (function() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
});
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
var $h_sjs_js_JavaScriptException = (function() {
  /*<skip>*/
});
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  $m_sjsr_StackTrace$().captureState__jl_Throwable__O__V(this, this.exception$4);
  return this
});
$c_sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = $as_sjs_js_JavaScriptException(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.toString__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_RuntimeException.prototype.init___.call(this);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $is_sjs_js_JavaScriptException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
});
var $as_sjs_js_JavaScriptException = (function(obj) {
  return (($is_sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
});
var $isArrayOf_sjs_js_JavaScriptException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
});
var $asArrayOf_sjs_js_JavaScriptException = (function(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
});
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$10 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$10.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$10.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$10;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$10 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$10.prototype = $c_s_reflect_ManifestFactory$$anon$10.prototype;
$c_s_reflect_ManifestFactory$$anon$10.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Long");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$10 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$10: 0
}, false, "scala.reflect.ManifestFactory$$anon$10", {
  s_reflect_ManifestFactory$$anon$10: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$10.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$10;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$11 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$11.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$11.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$11;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$11 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$11.prototype = $c_s_reflect_ManifestFactory$$anon$11.prototype;
$c_s_reflect_ManifestFactory$$anon$11.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Float");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$11 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$11: 0
}, false, "scala.reflect.ManifestFactory$$anon$11", {
  s_reflect_ManifestFactory$$anon$11: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$11.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$11;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$12 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$12.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$12.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$12;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$12 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$12.prototype = $c_s_reflect_ManifestFactory$$anon$12.prototype;
$c_s_reflect_ManifestFactory$$anon$12.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Double");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$12 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$12: 0
}, false, "scala.reflect.ManifestFactory$$anon$12", {
  s_reflect_ManifestFactory$$anon$12: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$12.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$12;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$13 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$13.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$13.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$13;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$13 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$13.prototype = $c_s_reflect_ManifestFactory$$anon$13.prototype;
$c_s_reflect_ManifestFactory$$anon$13.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Boolean");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$13 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$13: 0
}, false, "scala.reflect.ManifestFactory$$anon$13", {
  s_reflect_ManifestFactory$$anon$13: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$13.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$13;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$14 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$14.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$14.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$14;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$14 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$14.prototype = $c_s_reflect_ManifestFactory$$anon$14.prototype;
$c_s_reflect_ManifestFactory$$anon$14.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Unit");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$14 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$14: 0
}, false, "scala.reflect.ManifestFactory$$anon$14", {
  s_reflect_ManifestFactory$$anon$14: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$14.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$14;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$6 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$6.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$6.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$6;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$6 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$6.prototype = $c_s_reflect_ManifestFactory$$anon$6.prototype;
$c_s_reflect_ManifestFactory$$anon$6.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Byte");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$6 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$6: 0
}, false, "scala.reflect.ManifestFactory$$anon$6", {
  s_reflect_ManifestFactory$$anon$6: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$6.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$6;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$7 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$7.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$7.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$7;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$7 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$7.prototype = $c_s_reflect_ManifestFactory$$anon$7.prototype;
$c_s_reflect_ManifestFactory$$anon$7.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Short");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$7 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$7: 0
}, false, "scala.reflect.ManifestFactory$$anon$7", {
  s_reflect_ManifestFactory$$anon$7: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$7.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$7;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$8 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$8.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$8.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$8;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$8 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$8.prototype = $c_s_reflect_ManifestFactory$$anon$8.prototype;
$c_s_reflect_ManifestFactory$$anon$8.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Char");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$8 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$8: 0
}, false, "scala.reflect.ManifestFactory$$anon$8", {
  s_reflect_ManifestFactory$$anon$8: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$8.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$8;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$9 = (function() {
  $c_s_reflect_AnyValManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$9.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$$anon$9.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$9;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$9 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$9.prototype = $c_s_reflect_ManifestFactory$$anon$9.prototype;
$c_s_reflect_ManifestFactory$$anon$9.prototype.init___ = (function() {
  $c_s_reflect_AnyValManifest.prototype.init___T.call(this, "Int");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$9 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$9: 0
}, false, "scala.reflect.ManifestFactory$$anon$9", {
  s_reflect_ManifestFactory$$anon$9: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$9.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$9;
/** @constructor */
var $c_s_reflect_ManifestFactory$PhantomManifest = (function() {
  $c_s_reflect_ManifestFactory$ClassTypeManifest.call(this);
  this.toString$2 = null;
  this.hashCode$2 = 0
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype = new $h_s_reflect_ManifestFactory$ClassTypeManifest();
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.constructor = $c_s_reflect_ManifestFactory$PhantomManifest;
/** @constructor */
var $h_s_reflect_ManifestFactory$PhantomManifest = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$PhantomManifest.prototype = $c_s_reflect_ManifestFactory$PhantomManifest.prototype;
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.toString__T = (function() {
  return this.toString$2
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.hashCode__I = (function() {
  return this.hashCode$2
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T = (function(_runtimeClass, toString) {
  this.toString$2 = toString;
  $c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.init___s_Option__jl_Class__sci_List.call(this, $m_s_None$(), _runtimeClass, $m_sci_Nil$());
  this.hashCode$2 = $systemIdentityHashCode(this);
  return this
});
/** @constructor */
var $c_sci_List$ = (function() {
  $c_scg_SeqFactory.call(this);
  this.partialNotApplied$5 = null
});
$c_sci_List$.prototype = new $h_scg_SeqFactory();
$c_sci_List$.prototype.constructor = $c_sci_List$;
/** @constructor */
var $h_sci_List$ = (function() {
  /*<skip>*/
});
$h_sci_List$.prototype = $c_sci_List$.prototype;
$c_sci_List$.prototype.init___ = (function() {
  $c_scg_SeqFactory.prototype.init___.call(this);
  $n_sci_List$ = this;
  this.partialNotApplied$5 = new $c_sci_List$$anon$1().init___();
  return this
});
$c_sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_List$ = new $TypeData().initClass({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_List$.prototype.$classData = $d_sci_List$;
var $n_sci_List$ = (void 0);
var $m_sci_List$ = (function() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$().init___()
  };
  return $n_sci_List$
});
/** @constructor */
var $c_sci_Stream$ = (function() {
  $c_scg_SeqFactory.call(this)
});
$c_sci_Stream$.prototype = new $h_scg_SeqFactory();
$c_sci_Stream$.prototype.constructor = $c_sci_Stream$;
/** @constructor */
var $h_sci_Stream$ = (function() {
  /*<skip>*/
});
$h_sci_Stream$.prototype = $c_sci_Stream$.prototype;
$c_sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_Stream$StreamBuilder().init___()
});
var $d_sci_Stream$ = new $TypeData().initClass({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$.prototype.$classData = $d_sci_Stream$;
var $n_sci_Stream$ = (void 0);
var $m_sci_Stream$ = (function() {
  if ((!$n_sci_Stream$)) {
    $n_sci_Stream$ = new $c_sci_Stream$().init___()
  };
  return $n_sci_Stream$
});
/** @constructor */
var $c_scm_ArrayBuffer$ = (function() {
  $c_scg_SeqFactory.call(this)
});
$c_scm_ArrayBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ArrayBuffer$.prototype.constructor = $c_scm_ArrayBuffer$;
/** @constructor */
var $h_scm_ArrayBuffer$ = (function() {
  /*<skip>*/
});
$h_scm_ArrayBuffer$.prototype = $c_scm_ArrayBuffer$.prototype;
$c_scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_ArrayBuffer$ = new $TypeData().initClass({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer$.prototype.$classData = $d_scm_ArrayBuffer$;
var $n_scm_ArrayBuffer$ = (void 0);
var $m_scm_ArrayBuffer$ = (function() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$().init___()
  };
  return $n_scm_ArrayBuffer$
});
/** @constructor */
var $c_scm_ListBuffer$ = (function() {
  $c_scg_SeqFactory.call(this)
});
$c_scm_ListBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ListBuffer$.prototype.constructor = $c_scm_ListBuffer$;
/** @constructor */
var $h_scm_ListBuffer$ = (function() {
  /*<skip>*/
});
$h_scm_ListBuffer$.prototype = $c_scm_ListBuffer$.prototype;
$c_scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_ListBuffer().init___())
});
var $d_scm_ListBuffer$ = new $TypeData().initClass({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer$.prototype.$classData = $d_scm_ListBuffer$;
var $n_scm_ListBuffer$ = (void 0);
var $m_scm_ListBuffer$ = (function() {
  if ((!$n_scm_ListBuffer$)) {
    $n_scm_ListBuffer$ = new $c_scm_ListBuffer$().init___()
  };
  return $n_scm_ListBuffer$
});
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$1 = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$1.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$$anon$1.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$1;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$1 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$1.prototype = $c_s_reflect_ManifestFactory$$anon$1.prototype;
$c_s_reflect_ManifestFactory$$anon$1.prototype.init___ = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, $m_s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$ObjectTYPE$1, "Any");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$1 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$1: 0
}, false, "scala.reflect.ManifestFactory$$anon$1", {
  s_reflect_ManifestFactory$$anon$1: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$1.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$1;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$2 = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$2.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$$anon$2.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$2;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$2 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$2.prototype = $c_s_reflect_ManifestFactory$$anon$2.prototype;
$c_s_reflect_ManifestFactory$$anon$2.prototype.init___ = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, $m_s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$ObjectTYPE$1, "Object");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$2 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$2: 0
}, false, "scala.reflect.ManifestFactory$$anon$2", {
  s_reflect_ManifestFactory$$anon$2: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$2.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$2;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$3 = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$3.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$$anon$3.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$3;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$3 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$3.prototype = $c_s_reflect_ManifestFactory$$anon$3.prototype;
$c_s_reflect_ManifestFactory$$anon$3.prototype.init___ = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, $m_s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$ObjectTYPE$1, "AnyVal");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$3 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$3: 0
}, false, "scala.reflect.ManifestFactory$$anon$3", {
  s_reflect_ManifestFactory$$anon$3: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$3.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$3;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$4 = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$4.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$$anon$4.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$4;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$4 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$4.prototype = $c_s_reflect_ManifestFactory$$anon$4.prototype;
$c_s_reflect_ManifestFactory$$anon$4.prototype.init___ = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, $m_s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$NullTYPE$1, "Null");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$4 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$4: 0
}, false, "scala.reflect.ManifestFactory$$anon$4", {
  s_reflect_ManifestFactory$$anon$4: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$4.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$4;
/** @constructor */
var $c_s_reflect_ManifestFactory$$anon$5 = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
});
$c_s_reflect_ManifestFactory$$anon$5.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$$anon$5.prototype.constructor = $c_s_reflect_ManifestFactory$$anon$5;
/** @constructor */
var $h_s_reflect_ManifestFactory$$anon$5 = (function() {
  /*<skip>*/
});
$h_s_reflect_ManifestFactory$$anon$5.prototype = $c_s_reflect_ManifestFactory$$anon$5.prototype;
$c_s_reflect_ManifestFactory$$anon$5.prototype.init___ = (function() {
  $c_s_reflect_ManifestFactory$PhantomManifest.prototype.init___jl_Class__T.call(this, $m_s_reflect_ManifestFactory$().scala$reflect$ManifestFactory$$NothingTYPE$1, "Nothing");
  return this
});
var $d_s_reflect_ManifestFactory$$anon$5 = new $TypeData().initClass({
  s_reflect_ManifestFactory$$anon$5: 0
}, false, "scala.reflect.ManifestFactory$$anon$5", {
  s_reflect_ManifestFactory$$anon$5: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$$anon$5.prototype.$classData = $d_s_reflect_ManifestFactory$$anon$5;
var $is_sc_GenMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenMap)))
});
var $as_sc_GenMap = (function(obj) {
  return (($is_sc_GenMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenMap"))
});
var $isArrayOf_sc_GenMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenMap)))
});
var $asArrayOf_sc_GenMap = (function(obj, depth) {
  return (($isArrayOf_sc_GenMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenMap;", depth))
});
var $is_sc_GenSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
});
var $as_sc_GenSeq = (function(obj) {
  return (($is_sc_GenSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSeq"))
});
var $isArrayOf_sc_GenSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
});
var $asArrayOf_sc_GenSeq = (function(obj, depth) {
  return (($isArrayOf_sc_GenSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
});
/** @constructor */
var $c_sci_Vector$ = (function() {
  $c_scg_IndexedSeqFactory.call(this);
  this.NIL$6 = null;
  this.Log2ConcatFaster$6 = 0;
  this.TinyAppendFaster$6 = 0
});
$c_sci_Vector$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_Vector$.prototype.constructor = $c_sci_Vector$;
/** @constructor */
var $h_sci_Vector$ = (function() {
  /*<skip>*/
});
$h_sci_Vector$.prototype = $c_sci_Vector$.prototype;
$c_sci_Vector$.prototype.init___ = (function() {
  $c_scg_IndexedSeqFactory.prototype.init___.call(this);
  $n_sci_Vector$ = this;
  this.NIL$6 = new $c_sci_Vector().init___I__I__I(0, 0, 0);
  return this
});
$c_sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_Vector$ = new $TypeData().initClass({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector$.prototype.$classData = $d_sci_Vector$;
var $n_sci_Vector$ = (void 0);
var $m_sci_Vector$ = (function() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$().init___()
  };
  return $n_sci_Vector$
});
/** @constructor */
var $c_Ljapgolly_scalajs_react_vdom_package$all$ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_package$Base.call(this);
  this.background$4 = null;
  this.backgroundRepeat$4 = null;
  this.backgroundPosition$4 = null;
  this.backgroundColor$4 = null;
  this.backgroundImage$4 = null;
  this.borderTopColor$4 = null;
  this.borderStyle$4 = null;
  this.borderTopStyle$4 = null;
  this.borderRightStyle$4 = null;
  this.borderRightWidth$4 = null;
  this.borderTopRightRadius$4 = null;
  this.borderBottomLeftRadius$4 = null;
  this.borderRightColor$4 = null;
  this.borderBottom$4 = null;
  this.border$4 = null;
  this.borderBottomWidth$4 = null;
  this.borderLeftColor$4 = null;
  this.borderBottomColor$4 = null;
  this.borderLeft$4 = null;
  this.borderLeftStyle$4 = null;
  this.borderRight$4 = null;
  this.borderBottomStyle$4 = null;
  this.borderLeftWidth$4 = null;
  this.borderTopWidth$4 = null;
  this.borderTop$4 = null;
  this.borderRadius$4 = null;
  this.borderWidth$4 = null;
  this.borderBottomRightRadius$4 = null;
  this.borderTopLeftRadius$4 = null;
  this.borderColor$4 = null;
  this.opacity$4 = null;
  this.maxWidth$4 = null;
  this.overflow$4 = null;
  this.height$4 = null;
  this.paddingRight$4 = null;
  this.paddingTop$4 = null;
  this.paddingLeft$4 = null;
  this.padding$4 = null;
  this.paddingBottom$4 = null;
  this.right$4 = null;
  this.lineHeight$4 = null;
  this.left$4 = null;
  this.listStyle$4 = null;
  this.overflowY$4 = null;
  this.boxShadow$4 = null;
  this.fontSizeAdjust$4 = null;
  this.fontFamily$4 = null;
  this.font$4 = null;
  this.fontFeatureSettings$4 = null;
  this.marginBottom$4 = null;
  this.marginRight$4 = null;
  this.marginTop$4 = null;
  this.marginLeft$4 = null;
  this.top$4 = null;
  this.width$4 = null;
  this.bottom$4 = null;
  this.letterSpacing$4 = null;
  this.maxHeight$4 = null;
  this.minWidth$4 = null;
  this.minHeight$4 = null;
  this.outline$4 = null;
  this.outlineStyle$4 = null;
  this.overflowX$4 = null;
  this.textAlignLast$4 = null;
  this.textAlign$4 = null;
  this.textIndent$4 = null;
  this.textShadow$4 = null;
  this.wordSpacing$4 = null;
  this.zIndex$4 = null;
  this.animationDirection$4 = null;
  this.animationDuration$4 = null;
  this.animationName$4 = null;
  this.animationFillMode$4 = null;
  this.animationIterationCount$4 = null;
  this.animationDelay$4 = null;
  this.animationTimingFunction$4 = null;
  this.animationPlayState$4 = null;
  this.animation$4 = null;
  this.columnCount$4 = null;
  this.columnGap$4 = null;
  this.columnRule$4 = null;
  this.columnWidth$4 = null;
  this.columnRuleColor$4 = null;
  this.contentStyle$4 = null;
  this.counterIncrement$4 = null;
  this.counterReset$4 = null;
  this.orphans$4 = null;
  this.widows$4 = null;
  this.pageBreakAfter$4 = null;
  this.pageBreakInside$4 = null;
  this.pageBreakBefore$4 = null;
  this.perspective$4 = null;
  this.perspectiveOrigin$4 = null;
  this.transitionDelay$4 = null;
  this.transition$4 = null;
  this.transitionTimingFunction$4 = null;
  this.transitionDuration$4 = null;
  this.transitionProperty$4 = null;
  this.transform$4 = null;
  this.flex$4 = null;
  this.flexBasis$4 = null;
  this.flexGrow$4 = null;
  this.flexShrink$4 = null;
  this.transformOrigin$4 = null;
  this.className$4 = null;
  this.cls$4 = null;
  this.class$4 = null;
  this.colSpan$4 = null;
  this.rowSpan$4 = null;
  this.htmlFor$4 = null;
  this.ref$4 = null;
  this.key$4 = null;
  this.draggable$4 = null;
  this.onDragStart$4 = null;
  this.onDragEnd$4 = null;
  this.onDragEnter$4 = null;
  this.onDragOver$4 = null;
  this.onDragLeave$4 = null;
  this.onDrop$4 = null;
  this.onBeforeInput$4 = null;
  this.acceptCharset$4 = null;
  this.accessKey$4 = null;
  this.allowFullScreen$4 = null;
  this.allowTransparency$4 = null;
  this.async$4 = null;
  this.autoCapitalize$4 = null;
  this.autoCorrect$4 = null;
  this.autoPlay$4 = null;
  this.cellPadding$4 = null;
  this.cellSpacing$4 = null;
  this.classID$4 = null;
  this.contentEditable$4 = null;
  this.contextMenu$4 = null;
  this.controls$4 = null;
  this.coords$4 = null;
  this.crossOrigin$4 = null;
  this.dateTime$4 = null;
  this.defer$4 = null;
  this.defaultValue$4 = null;
  this.dir$4 = null;
  this.download$4 = null;
  this.encType$4 = null;
  this.formAction$4 = null;
  this.formEncType$4 = null;
  this.formMethod$4 = null;
  this.formNoValidate$4 = null;
  this.formTarget$4 = null;
  this.frameBorder$4 = null;
  this.headers$4 = null;
  this.hrefLang$4 = null;
  this.icon$4 = null;
  this.itemProp$4 = null;
  this.itemScope$4 = null;
  this.itemType$4 = null;
  this.list$4 = null;
  this.loop$4 = null;
  this.manifest$4 = null;
  this.marginHeight$4 = null;
  this.marginWidth$4 = null;
  this.maxLength$4 = null;
  this.mediaGroup$4 = null;
  this.multiple$4 = null;
  this.muted$4 = null;
  this.noValidate$4 = null;
  this.open$4 = null;
  this.poster$4 = null;
  this.preload$4 = null;
  this.radioGroup$4 = null;
  this.sandbox$4 = null;
  this.scope$4 = null;
  this.scrolling$4 = null;
  this.seamless$4 = null;
  this.selected$4 = null;
  this.shape$4 = null;
  this.sizes$4 = null;
  this.srcDoc$4 = null;
  this.srcSet$4 = null;
  this.step$4 = null;
  this.useMap$4 = null;
  this.wmode$4 = null;
  this.dangerouslySetInnerHtmlAttr$4 = null;
  this.href$4 = null;
  this.action$4 = null;
  this.method$4 = null;
  this.id$4 = null;
  this.target$4 = null;
  this.name$4 = null;
  this.alt$4 = null;
  this.onBlur$4 = null;
  this.onChange$4 = null;
  this.onClick$4 = null;
  this.onDblClick$4 = null;
  this.onError$4 = null;
  this.onFocus$4 = null;
  this.onKeyDown$4 = null;
  this.onKeyUp$4 = null;
  this.onKeyPress$4 = null;
  this.onLoad$4 = null;
  this.onMouseDown$4 = null;
  this.onMouseMove$4 = null;
  this.onMouseOut$4 = null;
  this.onMouseOver$4 = null;
  this.onMouseUp$4 = null;
  this.onTouchCancel$4 = null;
  this.onTouchEnd$4 = null;
  this.onTouchMove$4 = null;
  this.onTouchStart$4 = null;
  this.onSelect$4 = null;
  this.onScroll$4 = null;
  this.onSubmit$4 = null;
  this.onReset$4 = null;
  this.rel$4 = null;
  this.src$4 = null;
  this.style$4 = null;
  this.title$4 = null;
  this.type$4 = null;
  this.tpe$4 = null;
  this.xmlns$4 = null;
  this.lang$4 = null;
  this.placeholder$4 = null;
  this.spellCheck$4 = null;
  this.value$4 = null;
  this.accept$4 = null;
  this.autoComplete$4 = null;
  this.autoFocus$4 = null;
  this.checked$4 = null;
  this.charset$4 = null;
  this.disabled$4 = null;
  this.for$4 = null;
  this.readOnly$4 = null;
  this.required$4 = null;
  this.rows$4 = null;
  this.cols$4 = null;
  this.size$4 = null;
  this.tabIndex$4 = null;
  this.role$4 = null;
  this.contentAttr$4 = null;
  this.httpEquiv$4 = null;
  this.media$4 = null;
  this.big$4 = null;
  this.dialog$4 = null;
  this.menuitem$4 = null;
  this.html$4 = null;
  this.head$4 = null;
  this.base$4 = null;
  this.link$4 = null;
  this.meta$4 = null;
  this.script$4 = null;
  this.body$4 = null;
  this.h1$4 = null;
  this.h2$4 = null;
  this.h3$4 = null;
  this.h4$4 = null;
  this.h5$4 = null;
  this.h6$4 = null;
  this.header$4 = null;
  this.footer$4 = null;
  this.p$4 = null;
  this.hr$4 = null;
  this.pre$4 = null;
  this.blockquote$4 = null;
  this.ol$4 = null;
  this.ul$4 = null;
  this.li$4 = null;
  this.dl$4 = null;
  this.dt$4 = null;
  this.dd$4 = null;
  this.figure$4 = null;
  this.figcaption$4 = null;
  this.div$4 = null;
  this.a$4 = null;
  this.em$4 = null;
  this.strong$4 = null;
  this.small$4 = null;
  this.s$4 = null;
  this.cite$4 = null;
  this.code$4 = null;
  this.sub$4 = null;
  this.sup$4 = null;
  this.i$4 = null;
  this.b$4 = null;
  this.u$4 = null;
  this.span$4 = null;
  this.br$4 = null;
  this.wbr$4 = null;
  this.ins$4 = null;
  this.del$4 = null;
  this.img$4 = null;
  this.iframe$4 = null;
  this.embed$4 = null;
  this.object$4 = null;
  this.param$4 = null;
  this.video$4 = null;
  this.audio$4 = null;
  this.source$4 = null;
  this.track$4 = null;
  this.canvas$4 = null;
  this.map$4 = null;
  this.area$4 = null;
  this.table$4 = null;
  this.caption$4 = null;
  this.colgroup$4 = null;
  this.col$4 = null;
  this.tbody$4 = null;
  this.thead$4 = null;
  this.tfoot$4 = null;
  this.tr$4 = null;
  this.td$4 = null;
  this.th$4 = null;
  this.form$4 = null;
  this.fieldset$4 = null;
  this.legend$4 = null;
  this.label$4 = null;
  this.input$4 = null;
  this.button$4 = null;
  this.select$4 = null;
  this.datalist$4 = null;
  this.optgroup$4 = null;
  this.option$4 = null;
  this.textarea$4 = null;
  this.titleTag$4 = null;
  this.styleTag$4 = null;
  this.noscript$4 = null;
  this.section$4 = null;
  this.nav$4 = null;
  this.article$4 = null;
  this.aside$4 = null;
  this.address$4 = null;
  this.main$4 = null;
  this.q$4 = null;
  this.dfn$4 = null;
  this.abbr$4 = null;
  this.data$4 = null;
  this.time$4 = null;
  this.var$4 = null;
  this.samp$4 = null;
  this.kbd$4 = null;
  this.math$4 = null;
  this.mark$4 = null;
  this.ruby$4 = null;
  this.rt$4 = null;
  this.rp$4 = null;
  this.bdi$4 = null;
  this.bdo$4 = null;
  this.keygen$4 = null;
  this.output$4 = null;
  this.progress$4 = null;
  this.meter$4 = null;
  this.details$4 = null;
  this.summary$4 = null;
  this.command$4 = null;
  this.menu$4 = null;
  this.backgroundAttachment$module$4 = null;
  this.backgroundOrigin$module$4 = null;
  this.backgroundClip$module$4 = null;
  this.backgroundSize$module$4 = null;
  this.borderCollapse$module$4 = null;
  this.borderSpacing$module$4 = null;
  this.boxSizing$module$4 = null;
  this.color$module$4 = null;
  this.clip$module$4 = null;
  this.cursor$module$4 = null;
  this.float$module$4 = null;
  this.direction$module$4 = null;
  this.display$module$4 = null;
  this.pointerEvents$module$4 = null;
  this.listStyleImage$module$4 = null;
  this.listStylePosition$module$4 = null;
  this.wordWrap$module$4 = null;
  this.verticalAlign$module$4 = null;
  this.mask$module$4 = null;
  this.emptyCells$module$4 = null;
  this.listStyleType$module$4 = null;
  this.captionSide$module$4 = null;
  this.position$module$4 = null;
  this.quotes$module$4 = null;
  this.tableLayout$module$4 = null;
  this.fontSize$module$4 = null;
  this.fontWeight$module$4 = null;
  this.fontStyle$module$4 = null;
  this.clear$module$4 = null;
  this.margin$module$4 = null;
  this.outlineWidth$module$4 = null;
  this.outlineColor$module$4 = null;
  this.textDecoration$module$4 = null;
  this.textOverflow$module$4 = null;
  this.textUnderlinePosition$module$4 = null;
  this.textTransform$module$4 = null;
  this.visibility$module$4 = null;
  this.whiteSpace$module$4 = null;
  this.backfaceVisibility$module$4 = null;
  this.columns$module$4 = null;
  this.columnFill$module$4 = null;
  this.columnSpan$module$4 = null;
  this.columnRuleWidth$module$4 = null;
  this.columnRuleStyle$module$4 = null;
  this.alignContent$module$4 = null;
  this.alignSelf$module$4 = null;
  this.flexWrap$module$4 = null;
  this.alignItems$module$4 = null;
  this.justifyContent$module$4 = null;
  this.flexDirection$module$4 = null;
  this.transformStyle$module$4 = null;
  this.unicodeBidi$module$4 = null;
  this.wordBreak$module$4 = null;
  this.aria$module$4 = null
});
$c_Ljapgolly_scalajs_react_vdom_package$all$.prototype = new $h_Ljapgolly_scalajs_react_vdom_package$Base();
$c_Ljapgolly_scalajs_react_vdom_package$all$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_package$all$;
/** @constructor */
var $h_Ljapgolly_scalajs_react_vdom_package$all$ = (function() {
  /*<skip>*/
});
$h_Ljapgolly_scalajs_react_vdom_package$all$.prototype = $c_Ljapgolly_scalajs_react_vdom_package$all$.prototype;
$c_Ljapgolly_scalajs_react_vdom_package$all$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_package$Base.prototype.init___.call(this);
  $n_Ljapgolly_scalajs_react_vdom_package$all$ = this;
  $s_Ljapgolly_scalajs_react_vdom_HtmlTags$class__$$init$__Ljapgolly_scalajs_react_vdom_HtmlTags__V(this);
  $s_Ljapgolly_scalajs_react_vdom_Extra$Tags$class__$$init$__Ljapgolly_scalajs_react_vdom_Extra$Tags__V(this);
  $s_Ljapgolly_scalajs_react_vdom_HtmlAttrs$class__$$init$__Ljapgolly_scalajs_react_vdom_HtmlAttrs__V(this);
  $s_Ljapgolly_scalajs_react_vdom_Extra$Attrs$class__$$init$__Ljapgolly_scalajs_react_vdom_Extra$Attrs__V(this);
  $s_Ljapgolly_scalajs_react_vdom_HtmlStyles$class__$$init$__Ljapgolly_scalajs_react_vdom_HtmlStyles__V(this);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_package$all$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_package$all$: 0
}, false, "japgolly.scalajs.react.vdom.package$all$", {
  Ljapgolly_scalajs_react_vdom_package$all$: 1,
  Ljapgolly_scalajs_react_vdom_package$Base: 1,
  Ljapgolly_scalajs_react_vdom_Implicits: 1,
  Ljapgolly_scalajs_react_vdom_LowPri: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_package$Tags: 1,
  Ljapgolly_scalajs_react_vdom_HtmlTags: 1,
  Ljapgolly_scalajs_react_vdom_Extra$Tags: 1,
  Ljapgolly_scalajs_react_vdom_package$Attrs: 1,
  Ljapgolly_scalajs_react_vdom_HtmlAttrs: 1,
  Ljapgolly_scalajs_react_vdom_Extra$Attrs: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStyles: 1
});
$c_Ljapgolly_scalajs_react_vdom_package$all$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_package$all$;
var $n_Ljapgolly_scalajs_react_vdom_package$all$ = (void 0);
var $m_Ljapgolly_scalajs_react_vdom_package$all$ = (function() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_package$all$)) {
    $n_Ljapgolly_scalajs_react_vdom_package$all$ = new $c_Ljapgolly_scalajs_react_vdom_package$all$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_package$all$
});
/** @constructor */
var $c_sc_AbstractTraversable = (function() {
  $c_O.call(this)
});
$c_sc_AbstractTraversable.prototype = new $h_O();
$c_sc_AbstractTraversable.prototype.constructor = $c_sc_AbstractTraversable;
/** @constructor */
var $h_sc_AbstractTraversable = (function() {
  /*<skip>*/
});
$h_sc_AbstractTraversable.prototype = $c_sc_AbstractTraversable.prototype;
$c_sc_AbstractTraversable.prototype.toList__sci_List = (function() {
  var this$1 = $m_sci_List$();
  var cbf = this$1.ReusableCBFInstance$2;
  return $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractTraversable.prototype.mkString__T__T = (function(sep) {
  return this.mkString__T__T__T__T("", sep, "")
});
$c_sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
$c_sc_AbstractTraversable.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
});
$c_sc_AbstractTraversable.prototype.newBuilder__scm_Builder = (function() {
  return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return $s_sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T(this)
});
var $is_sc_GenSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSet)))
});
var $as_sc_GenSet = (function(obj) {
  return (($is_sc_GenSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSet"))
});
var $isArrayOf_sc_GenSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSet)))
});
var $asArrayOf_sc_GenSet = (function(obj, depth) {
  return (($isArrayOf_sc_GenSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSet;", depth))
});
var $is_sc_IndexedSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
});
var $as_sc_IndexedSeqLike = (function(obj) {
  return (($is_sc_IndexedSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
});
var $isArrayOf_sc_IndexedSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
});
var $asArrayOf_sc_IndexedSeqLike = (function(obj, depth) {
  return (($isArrayOf_sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
});
var $is_sc_LinearSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
});
var $as_sc_LinearSeqLike = (function(obj) {
  return (($is_sc_LinearSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqLike"))
});
var $isArrayOf_sc_LinearSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
});
var $asArrayOf_sc_LinearSeqLike = (function(obj, depth) {
  return (($isArrayOf_sc_LinearSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqLike;", depth))
});
var $is_sc_LinearSeqOptimized = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
});
var $as_sc_LinearSeqOptimized = (function(obj) {
  return (($is_sc_LinearSeqOptimized(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqOptimized"))
});
var $isArrayOf_sc_LinearSeqOptimized = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
});
var $asArrayOf_sc_LinearSeqOptimized = (function(obj, depth) {
  return (($isArrayOf_sc_LinearSeqOptimized(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqOptimized;", depth))
});
/** @constructor */
var $c_sc_AbstractIterable = (function() {
  $c_sc_AbstractTraversable.call(this)
});
$c_sc_AbstractIterable.prototype = new $h_sc_AbstractTraversable();
$c_sc_AbstractIterable.prototype.constructor = $c_sc_AbstractIterable;
/** @constructor */
var $h_sc_AbstractIterable = (function() {
  /*<skip>*/
});
$h_sc_AbstractIterable.prototype = $c_sc_AbstractIterable.prototype;
$c_sc_AbstractIterable.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z(this, that)
});
$c_sc_AbstractIterable.prototype.forall__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return $s_sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, p)
});
$c_sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  $s_sc_Iterator$class__foreach__sc_Iterator__F1__V(this$1, f)
});
$c_sc_AbstractIterable.prototype.toStream__sci_Stream = (function() {
  return this.iterator__sc_Iterator().toStream__sci_Stream()
});
$c_sc_AbstractIterable.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V(this, xs, start, len)
});
var $is_sci_Iterable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
});
var $as_sci_Iterable = (function(obj) {
  return (($is_sci_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Iterable"))
});
var $isArrayOf_sci_Iterable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
});
var $asArrayOf_sci_Iterable = (function(obj, depth) {
  return (($isArrayOf_sci_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth))
});
var $d_sci_Iterable = new $TypeData().initClass({
  sci_Iterable: 0
}, true, "scala.collection.immutable.Iterable", {
  sci_Iterable: 1,
  sci_Traversable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  s_Immutable: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
/** @constructor */
var $c_sci_StringOps = (function() {
  $c_O.call(this);
  this.repr$1 = null
});
$c_sci_StringOps.prototype = new $h_O();
$c_sci_StringOps.prototype.constructor = $c_sci_StringOps;
/** @constructor */
var $h_sci_StringOps = (function() {
  /*<skip>*/
});
$h_sci_StringOps.prototype = $c_sci_StringOps.prototype;
$c_sci_StringOps.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  var c = (65535 & $uI($$this["charCodeAt"](idx)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_StringOps.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
$c_sci_StringOps.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_sci_StringOps.prototype.isEmpty__Z = (function() {
  return $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
$c_sci_StringOps.prototype.toList__sci_List = (function() {
  var this$1 = $m_sci_List$();
  var cbf = this$1.ReusableCBFInstance$2;
  return $as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(this, cbf))
});
$c_sci_StringOps.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.equals__O__Z = (function(x$1) {
  return $m_sci_StringOps$().equals$extension__T__O__Z(this.repr$1, x$1)
});
$c_sci_StringOps.prototype.mkString__T__T = (function(sep) {
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, "", sep, "")
});
$c_sci_StringOps.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
$c_sci_StringOps.prototype.toString__T = (function() {
  var $$this = this.repr$1;
  return $$this
});
$c_sci_StringOps.prototype.foreach__F1__V = (function(f) {
  $s_sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
$c_sci_StringOps.prototype.reverse__O = (function() {
  return $s_sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
$c_sci_StringOps.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this["length"])
});
$c_sci_StringOps.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI($$this["length"]))
});
$c_sci_StringOps.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this["length"])
});
$c_sci_StringOps.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI($$this["length"]));
  return $s_sc_Iterator$class__toStream__sc_Iterator__sci_Stream(this$3)
});
$c_sci_StringOps.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sci_StringOps.prototype.repr__O = (function() {
  return this.repr$1
});
$c_sci_StringOps.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $m_sjsr_RuntimeString$().hashCode__T__I($$this)
});
$c_sci_StringOps.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
$c_sci_StringOps.prototype.init___T = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_sci_StringOps.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
});
$c_sci_StringOps.prototype.toCollection__O__sc_Seq = (function(repr) {
  this.repr$1;
  var repr$1 = $as_T(repr);
  return new $c_sci_WrappedString().init___T(repr$1)
});
$c_sci_StringOps.prototype.newBuilder__scm_Builder = (function() {
  this.repr$1;
  return new $c_scm_StringBuilder().init___()
});
$c_sci_StringOps.prototype.stringPrefix__T = (function() {
  return $s_sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T(this)
});
var $is_sci_StringOps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_StringOps)))
});
var $as_sci_StringOps = (function(obj) {
  return (($is_sci_StringOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.StringOps"))
});
var $isArrayOf_sci_StringOps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_StringOps)))
});
var $asArrayOf_sci_StringOps = (function(obj, depth) {
  return (($isArrayOf_sci_StringOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.StringOps;", depth))
});
var $d_sci_StringOps = new $TypeData().initClass({
  sci_StringOps: 0
}, false, "scala.collection.immutable.StringOps", {
  sci_StringOps: 1,
  O: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_StringOps.prototype.$classData = $d_sci_StringOps;
var $is_sc_Seq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Seq)))
});
var $as_sc_Seq = (function(obj) {
  return (($is_sc_Seq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Seq"))
});
var $isArrayOf_sc_Seq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Seq)))
});
var $asArrayOf_sc_Seq = (function(obj, depth) {
  return (($isArrayOf_sc_Seq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Seq;", depth))
});
var $d_sc_Seq = new $TypeData().initClass({
  sc_Seq: 0
}, true, "scala.collection.Seq", {
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_Iterable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1
});
var $is_sc_Set = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Set)))
});
var $as_sc_Set = (function(obj) {
  return (($is_sc_Set(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Set"))
});
var $isArrayOf_sc_Set = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Set)))
});
var $asArrayOf_sc_Set = (function(obj, depth) {
  return (($isArrayOf_sc_Set(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Set;", depth))
});
/** @constructor */
var $c_scm_AbstractIterable = (function() {
  $c_sc_AbstractIterable.call(this)
});
$c_scm_AbstractIterable.prototype = new $h_sc_AbstractIterable();
$c_scm_AbstractIterable.prototype.constructor = $c_scm_AbstractIterable;
/** @constructor */
var $h_scm_AbstractIterable = (function() {
  /*<skip>*/
});
$h_scm_AbstractIterable.prototype = $c_scm_AbstractIterable.prototype;
var $is_sjs_js_ArrayOps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_ArrayOps)))
});
var $as_sjs_js_ArrayOps = (function(obj) {
  return (($is_sjs_js_ArrayOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.ArrayOps"))
});
var $isArrayOf_sjs_js_ArrayOps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_ArrayOps)))
});
var $asArrayOf_sjs_js_ArrayOps = (function(obj, depth) {
  return (($isArrayOf_sjs_js_ArrayOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.ArrayOps;", depth))
});
var $is_sc_IndexedSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
});
var $as_sc_IndexedSeq = (function(obj) {
  return (($is_sc_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeq"))
});
var $isArrayOf_sc_IndexedSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
});
var $asArrayOf_sc_IndexedSeq = (function(obj, depth) {
  return (($isArrayOf_sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
});
var $is_sc_LinearSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
});
var $as_sc_LinearSeq = (function(obj) {
  return (($is_sc_LinearSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeq"))
});
var $isArrayOf_sc_LinearSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
});
var $asArrayOf_sc_LinearSeq = (function(obj, depth) {
  return (($isArrayOf_sc_LinearSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
});
/** @constructor */
var $c_sc_AbstractSeq = (function() {
  $c_sc_AbstractIterable.call(this)
});
$c_sc_AbstractSeq.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSeq.prototype.constructor = $c_sc_AbstractSeq;
/** @constructor */
var $h_sc_AbstractSeq = (function() {
  /*<skip>*/
});
$h_sc_AbstractSeq.prototype = $c_sc_AbstractSeq.prototype;
$c_sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return $s_sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
});
$c_sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return $s_sc_SeqLike$class__isEmpty__sc_SeqLike__Z(this)
});
$c_sc_AbstractSeq.prototype.toString__T = (function() {
  return $s_sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
$c_sc_AbstractSeq.prototype.reverse__O = (function() {
  return $s_sc_SeqLike$class__reverse__sc_SeqLike__O(this)
});
$c_sc_AbstractSeq.prototype.size__I = (function() {
  return this.length__I()
});
$c_sc_AbstractSeq.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
});
$c_sc_AbstractSeq.prototype.toCollection__O__sc_Seq = (function(repr) {
  return $as_sc_Seq(repr)
});
/** @constructor */
var $c_sc_AbstractMap = (function() {
  $c_sc_AbstractIterable.call(this)
});
$c_sc_AbstractMap.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractMap.prototype.constructor = $c_sc_AbstractMap;
/** @constructor */
var $h_sc_AbstractMap = (function() {
  /*<skip>*/
});
$h_sc_AbstractMap.prototype = $c_sc_AbstractMap.prototype;
$c_sc_AbstractMap.prototype.apply__O__O = (function(key) {
  return $s_sc_MapLike$class__apply__sc_MapLike__O__O(this, key)
});
$c_sc_AbstractMap.prototype.isEmpty__Z = (function() {
  return $s_sc_MapLike$class__isEmpty__sc_MapLike__Z(this)
});
$c_sc_AbstractMap.prototype.equals__O__Z = (function(that) {
  return $s_sc_GenMapLike$class__equals__sc_GenMapLike__O__Z(this, that)
});
$c_sc_AbstractMap.prototype.toString__T = (function() {
  return $s_sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
$c_sc_AbstractMap.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $s_sc_MapLike$class__addString__sc_MapLike__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractMap.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var xs = this.seq__sc_Map();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(xs, this$1.mapSeed$2)
});
$c_sc_AbstractMap.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_MapBuilder().init___sc_GenMap(this.empty__sc_Map())
});
$c_sc_AbstractMap.prototype.stringPrefix__T = (function() {
  return "Map"
});
/** @constructor */
var $c_sc_AbstractSet = (function() {
  $c_sc_AbstractIterable.call(this)
});
$c_sc_AbstractSet.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSet.prototype.constructor = $c_sc_AbstractSet;
/** @constructor */
var $h_sc_AbstractSet = (function() {
  /*<skip>*/
});
$h_sc_AbstractSet.prototype = $c_sc_AbstractSet.prototype;
$c_sc_AbstractSet.prototype.isEmpty__Z = (function() {
  return $s_sc_SetLike$class__isEmpty__sc_SetLike__Z(this)
});
$c_sc_AbstractSet.prototype.equals__O__Z = (function(that) {
  return $s_sc_GenSetLike$class__equals__sc_GenSetLike__O__Z(this, that)
});
$c_sc_AbstractSet.prototype.toString__T = (function() {
  return $s_sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
$c_sc_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  return this.forall__F1__Z(that)
});
$c_sc_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
$c_sc_AbstractSet.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
});
$c_sc_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.empty__sc_Set())
});
$c_sc_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
/** @constructor */
var $c_sci_AbstractMap = (function() {
  $c_sc_AbstractMap.call(this)
});
$c_sci_AbstractMap.prototype = new $h_sc_AbstractMap();
$c_sci_AbstractMap.prototype.constructor = $c_sci_AbstractMap;
/** @constructor */
var $h_sci_AbstractMap = (function() {
  /*<skip>*/
});
$h_sci_AbstractMap.prototype = $c_sci_AbstractMap.prototype;
$c_sci_AbstractMap.prototype.init___ = (function() {
  return this
});
$c_sci_AbstractMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_AbstractMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_AbstractMap.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Iterable$()
});
$c_sci_AbstractMap.prototype.empty__sc_Map = (function() {
  return this.empty__sci_Map()
});
$c_sci_AbstractMap.prototype.empty__sci_Map = (function() {
  return $m_sci_Map$EmptyMap$()
});
$c_sci_AbstractMap.prototype.seq__sc_Map = (function() {
  return this
});
/** @constructor */
var $c_sci_ListSet = (function() {
  $c_sc_AbstractSet.call(this)
});
$c_sci_ListSet.prototype = new $h_sc_AbstractSet();
$c_sci_ListSet.prototype.constructor = $c_sci_ListSet;
/** @constructor */
var $h_sci_ListSet = (function() {
  /*<skip>*/
});
$h_sci_ListSet.prototype = $c_sci_ListSet.prototype;
$c_sci_ListSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_ListSet.prototype.init___ = (function() {
  return this
});
$c_sci_ListSet.prototype.head__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("Set has no elements")
});
$c_sci_ListSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_ListSet.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_ListSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListSet.prototype.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet = (function() {
  throw new $c_ju_NoSuchElementException().init___T("Empty ListSet has no outer pointer")
});
$c_sci_ListSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_ListSet$()
});
$c_sci_ListSet.prototype.$$plus__O__sci_ListSet = (function(elem) {
  return new $c_sci_ListSet$Node().init___sci_ListSet__O(this, elem)
});
$c_sci_ListSet.prototype.size__I = (function() {
  return 0
});
$c_sci_ListSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_ListSet$$anon$1().init___sci_ListSet(this)
});
$c_sci_ListSet.prototype.empty__sc_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
$c_sci_ListSet.prototype.contains__O__Z = (function(elem) {
  return false
});
$c_sci_ListSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
$c_sci_ListSet.prototype.tail__sci_ListSet = (function() {
  throw new $c_ju_NoSuchElementException().init___T("Next of an empty set")
});
$c_sci_ListSet.prototype.stringPrefix__T = (function() {
  return "ListSet"
});
var $is_sci_ListSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListSet)))
});
var $as_sci_ListSet = (function(obj) {
  return (($is_sci_ListSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ListSet"))
});
var $isArrayOf_sci_ListSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListSet)))
});
var $asArrayOf_sci_ListSet = (function(obj, depth) {
  return (($isArrayOf_sci_ListSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ListSet;", depth))
});
/** @constructor */
var $c_sci_Set$EmptySet$ = (function() {
  $c_sc_AbstractSet.call(this)
});
$c_sci_Set$EmptySet$.prototype = new $h_sc_AbstractSet();
$c_sci_Set$EmptySet$.prototype.constructor = $c_sci_Set$EmptySet$;
/** @constructor */
var $h_sci_Set$EmptySet$ = (function() {
  /*<skip>*/
});
$h_sci_Set$EmptySet$.prototype = $c_sci_Set$EmptySet$.prototype;
$c_sci_Set$EmptySet$.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.init___ = (function() {
  $n_sci_Set$EmptySet$ = this;
  return this
});
$c_sci_Set$EmptySet$.prototype.apply__O__O = (function(v1) {
  return false
});
$c_sci_Set$EmptySet$.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$EmptySet$.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_Set$EmptySet$.prototype.size__I = (function() {
  return 0
});
$c_sci_Set$EmptySet$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Set$EmptySet$.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$EmptySet$.prototype.$$plus__O__sc_Set = (function(elem) {
  return new $c_sci_Set$Set1().init___O(elem)
});
var $d_sci_Set$EmptySet$ = new $TypeData().initClass({
  sci_Set$EmptySet$: 0
}, false, "scala.collection.immutable.Set$EmptySet$", {
  sci_Set$EmptySet$: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$EmptySet$.prototype.$classData = $d_sci_Set$EmptySet$;
var $n_sci_Set$EmptySet$ = (void 0);
var $m_sci_Set$EmptySet$ = (function() {
  if ((!$n_sci_Set$EmptySet$)) {
    $n_sci_Set$EmptySet$ = new $c_sci_Set$EmptySet$().init___()
  };
  return $n_sci_Set$EmptySet$
});
/** @constructor */
var $c_sci_Set$Set1 = (function() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null
});
$c_sci_Set$Set1.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set1.prototype.constructor = $c_sci_Set$Set1;
/** @constructor */
var $h_sci_Set$Set1 = (function() {
  /*<skip>*/
});
$h_sci_Set$Set1.prototype = $c_sci_Set$Set1.prototype;
$c_sci_Set$Set1.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set1.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set1.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set1.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set1.prototype.forall__F1__Z = (function(f) {
  return $uZ(f.apply__O__O(this.elem1$4))
});
$c_sci_Set$Set1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4)
});
$c_sci_Set$Set1.prototype.size__I = (function() {
  return 1
});
$c_sci_Set$Set1.prototype.init___O = (function(elem1) {
  this.elem1$4 = elem1;
  return this
});
$c_sci_Set$Set1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_Set$Set1.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set1.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set2().init___O__O(this.elem1$4, elem))
});
$c_sci_Set$Set1.prototype.contains__O__Z = (function(elem) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4)
});
$c_sci_Set$Set1.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set1 = new $TypeData().initClass({
  sci_Set$Set1: 0
}, false, "scala.collection.immutable.Set$Set1", {
  sci_Set$Set1: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set1.prototype.$classData = $d_sci_Set$Set1;
/** @constructor */
var $c_sci_Set$Set2 = (function() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null
});
$c_sci_Set$Set2.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set2.prototype.constructor = $c_sci_Set$Set2;
/** @constructor */
var $h_sci_Set$Set2 = (function() {
  /*<skip>*/
});
$h_sci_Set$Set2.prototype = $c_sci_Set$Set2.prototype;
$c_sci_Set$Set2.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set2.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set2.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set2.prototype.init___O__O = (function(elem1, elem2) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  return this
});
$c_sci_Set$Set2.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set2.prototype.forall__F1__Z = (function(f) {
  return ($uZ(f.apply__O__O(this.elem1$4)) && $uZ(f.apply__O__O(this.elem2$4)))
});
$c_sci_Set$Set2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4)
});
$c_sci_Set$Set2.prototype.size__I = (function() {
  return 2
});
$c_sci_Set$Set2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_Set$Set2.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set2.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set3().init___O__O__O(this.elem1$4, this.elem2$4, elem))
});
$c_sci_Set$Set2.prototype.contains__O__Z = (function(elem) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4))
});
$c_sci_Set$Set2.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set2 = new $TypeData().initClass({
  sci_Set$Set2: 0
}, false, "scala.collection.immutable.Set$Set2", {
  sci_Set$Set2: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set2.prototype.$classData = $d_sci_Set$Set2;
/** @constructor */
var $c_sci_Set$Set3 = (function() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null
});
$c_sci_Set$Set3.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set3.prototype.constructor = $c_sci_Set$Set3;
/** @constructor */
var $h_sci_Set$Set3 = (function() {
  /*<skip>*/
});
$h_sci_Set$Set3.prototype = $c_sci_Set$Set3.prototype;
$c_sci_Set$Set3.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set3.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set3.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set3.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set3.prototype.forall__F1__Z = (function(f) {
  return (($uZ(f.apply__O__O(this.elem1$4)) && $uZ(f.apply__O__O(this.elem2$4))) && $uZ(f.apply__O__O(this.elem3$4)))
});
$c_sci_Set$Set3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4)
});
$c_sci_Set$Set3.prototype.init___O__O__O = (function(elem1, elem2, elem3) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  return this
});
$c_sci_Set$Set3.prototype.size__I = (function() {
  return 3
});
$c_sci_Set$Set3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_Set$Set3.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set3.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set4().init___O__O__O__O(this.elem1$4, this.elem2$4, this.elem3$4, elem))
});
$c_sci_Set$Set3.prototype.contains__O__Z = (function(elem) {
  return (($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4))
});
$c_sci_Set$Set3.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set3 = new $TypeData().initClass({
  sci_Set$Set3: 0
}, false, "scala.collection.immutable.Set$Set3", {
  sci_Set$Set3: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set3.prototype.$classData = $d_sci_Set$Set3;
/** @constructor */
var $c_sci_Set$Set4 = (function() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null;
  this.elem4$4 = null
});
$c_sci_Set$Set4.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set4.prototype.constructor = $c_sci_Set$Set4;
/** @constructor */
var $h_sci_Set$Set4 = (function() {
  /*<skip>*/
});
$h_sci_Set$Set4.prototype = $c_sci_Set$Set4.prototype;
$c_sci_Set$Set4.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set4.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set4.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set4.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set4.prototype.forall__F1__Z = (function(f) {
  return ((($uZ(f.apply__O__O(this.elem1$4)) && $uZ(f.apply__O__O(this.elem2$4))) && $uZ(f.apply__O__O(this.elem3$4))) && $uZ(f.apply__O__O(this.elem4$4)))
});
$c_sci_Set$Set4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4);
  f.apply__O__O(this.elem4$4)
});
$c_sci_Set$Set4.prototype.size__I = (function() {
  return 4
});
$c_sci_Set$Set4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4, this.elem4$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_Set$Set4.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set4.prototype.$$plus__O__sci_Set = (function(elem) {
  if (this.contains__O__Z(elem)) {
    return this
  } else {
    var this$1 = new $c_sci_HashSet().init___();
    var elem1 = this.elem1$4;
    var elem2 = this.elem2$4;
    var array = [this.elem3$4, this.elem4$4, elem];
    var this$2 = this$1.$$plus__O__sci_HashSet(elem1).$$plus__O__sci_HashSet(elem2);
    var start = 0;
    var end = $uI(array["length"]);
    var z = this$2;
    x: {
      var jsx$1;
      _foldl: while (true) {
        if ((start === end)) {
          var jsx$1 = z;
          break x
        } else {
          var temp$start = ((1 + start) | 0);
          var arg1 = z;
          var index = start;
          var arg2 = array[index];
          var x$2 = $as_sc_Set(arg1);
          var temp$z = x$2.$$plus__O__sc_Set(arg2);
          start = temp$start;
          z = temp$z;
          continue _foldl
        }
      }
    };
    return $as_sci_HashSet($as_sc_Set(jsx$1))
  }
});
$c_sci_Set$Set4.prototype.contains__O__Z = (function(elem) {
  return ((($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem4$4))
});
$c_sci_Set$Set4.prototype.init___O__O__O__O = (function(elem1, elem2, elem3, elem4) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  this.elem4$4 = elem4;
  return this
});
$c_sci_Set$Set4.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set4 = new $TypeData().initClass({
  sci_Set$Set4: 0
}, false, "scala.collection.immutable.Set$Set4", {
  sci_Set$Set4: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set4.prototype.$classData = $d_sci_Set$Set4;
var $is_scm_IndexedSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_IndexedSeq)))
});
var $as_scm_IndexedSeq = (function(obj) {
  return (($is_scm_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.IndexedSeq"))
});
var $isArrayOf_scm_IndexedSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_IndexedSeq)))
});
var $asArrayOf_scm_IndexedSeq = (function(obj, depth) {
  return (($isArrayOf_scm_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.IndexedSeq;", depth))
});
/** @constructor */
var $c_sci_HashSet = (function() {
  $c_sc_AbstractSet.call(this)
});
$c_sci_HashSet.prototype = new $h_sc_AbstractSet();
$c_sci_HashSet.prototype.constructor = $c_sci_HashSet;
/** @constructor */
var $h_sci_HashSet = (function() {
  /*<skip>*/
});
$h_sci_HashSet.prototype = $c_sci_HashSet.prototype;
$c_sci_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return new $c_sci_HashSet$HashSet1().init___O__I(key, hash)
});
$c_sci_HashSet.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_ScalaRunTime$().hash__O__I(key))
});
$c_sci_HashSet.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_HashSet.prototype.$$plus__O__sci_HashSet = (function(e) {
  return this.updated0__O__I__I__sci_HashSet(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_HashSet$()
});
$c_sci_HashSet.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  if ($is_sci_HashSet(that)) {
    var x2 = $as_sci_HashSet(that);
    return this.subsetOf0__sci_HashSet__I__Z(x2, 0)
  } else {
    var this$1 = this.iterator__sc_Iterator();
    return $s_sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, that)
  }
});
$c_sci_HashSet.prototype.size__I = (function() {
  return 0
});
$c_sci_HashSet.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashSet.prototype.empty__sc_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
$c_sci_HashSet.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashSet.prototype.contains__O__Z = (function(e) {
  return this.get0__O__I__I__Z(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_HashSet(elem)
});
$c_sci_HashSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return false
});
$c_sci_HashSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return true
});
var $is_sci_HashSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet)))
});
var $as_sci_HashSet = (function(obj) {
  return (($is_sci_HashSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet"))
});
var $isArrayOf_sci_HashSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet)))
});
var $asArrayOf_sci_HashSet = (function(obj, depth) {
  return (($isArrayOf_sci_HashSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet;", depth))
});
var $d_sci_HashSet = new $TypeData().initClass({
  sci_HashSet: 0
}, false, "scala.collection.immutable.HashSet", {
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet.prototype.$classData = $d_sci_HashSet;
/** @constructor */
var $c_sci_ListSet$EmptyListSet$ = (function() {
  $c_sci_ListSet.call(this)
});
$c_sci_ListSet$EmptyListSet$.prototype = new $h_sci_ListSet();
$c_sci_ListSet$EmptyListSet$.prototype.constructor = $c_sci_ListSet$EmptyListSet$;
/** @constructor */
var $h_sci_ListSet$EmptyListSet$ = (function() {
  /*<skip>*/
});
$h_sci_ListSet$EmptyListSet$.prototype = $c_sci_ListSet$EmptyListSet$.prototype;
var $d_sci_ListSet$EmptyListSet$ = new $TypeData().initClass({
  sci_ListSet$EmptyListSet$: 0
}, false, "scala.collection.immutable.ListSet$EmptyListSet$", {
  sci_ListSet$EmptyListSet$: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$EmptyListSet$.prototype.$classData = $d_sci_ListSet$EmptyListSet$;
var $n_sci_ListSet$EmptyListSet$ = (void 0);
var $m_sci_ListSet$EmptyListSet$ = (function() {
  if ((!$n_sci_ListSet$EmptyListSet$)) {
    $n_sci_ListSet$EmptyListSet$ = new $c_sci_ListSet$EmptyListSet$().init___()
  };
  return $n_sci_ListSet$EmptyListSet$
});
/** @constructor */
var $c_sci_ListSet$Node = (function() {
  $c_sci_ListSet.call(this);
  this.head$5 = null;
  this.$$outer$f = null
});
$c_sci_ListSet$Node.prototype = new $h_sci_ListSet();
$c_sci_ListSet$Node.prototype.constructor = $c_sci_ListSet$Node;
/** @constructor */
var $h_sci_ListSet$Node = (function() {
  /*<skip>*/
});
$h_sci_ListSet$Node.prototype = $c_sci_ListSet$Node.prototype;
$c_sci_ListSet$Node.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_ListSet$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListSet$Node.prototype.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet = (function() {
  return this.$$outer$f
});
$c_sci_ListSet$Node.prototype.$$plus__O__sci_ListSet = (function(e) {
  return (this.containsInternal__p5__sci_ListSet__O__Z(this, e) ? this : new $c_sci_ListSet$Node().init___sci_ListSet__O(this, e))
});
$c_sci_ListSet$Node.prototype.sizeInternal__p5__sci_ListSet__I__I = (function(n, acc) {
  _sizeInternal: while (true) {
    if (n.isEmpty__Z()) {
      return acc
    } else {
      var temp$n = n.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet();
      var temp$acc = ((1 + acc) | 0);
      n = temp$n;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
$c_sci_ListSet$Node.prototype.size__I = (function() {
  return this.sizeInternal__p5__sci_ListSet__I__I(this, 0)
});
$c_sci_ListSet$Node.prototype.init___sci_ListSet__O = (function($$outer, head) {
  this.head$5 = head;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
$c_sci_ListSet$Node.prototype.contains__O__Z = (function(e) {
  return this.containsInternal__p5__sci_ListSet__O__Z(this, e)
});
$c_sci_ListSet$Node.prototype.containsInternal__p5__sci_ListSet__O__Z = (function(n, e) {
  _containsInternal: while (true) {
    if ((!n.isEmpty__Z())) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(n.head__O(), e)) {
        return true
      } else {
        n = n.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
$c_sci_ListSet$Node.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
$c_sci_ListSet$Node.prototype.tail__sci_ListSet = (function() {
  return this.$$outer$f
});
var $d_sci_ListSet$Node = new $TypeData().initClass({
  sci_ListSet$Node: 0
}, false, "scala.collection.immutable.ListSet$Node", {
  sci_ListSet$Node: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$Node.prototype.$classData = $d_sci_ListSet$Node;
/** @constructor */
var $c_scm_AbstractSeq = (function() {
  $c_sc_AbstractSeq.call(this)
});
$c_scm_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_scm_AbstractSeq.prototype.constructor = $c_scm_AbstractSeq;
/** @constructor */
var $h_scm_AbstractSeq = (function() {
  /*<skip>*/
});
$h_scm_AbstractSeq.prototype = $c_scm_AbstractSeq.prototype;
$c_scm_AbstractSeq.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__scm_Seq()
});
$c_scm_AbstractSeq.prototype.seq__scm_Seq = (function() {
  return this
});
/** @constructor */
var $c_sci_HashSet$EmptyHashSet$ = (function() {
  $c_sci_HashSet.call(this)
});
$c_sci_HashSet$EmptyHashSet$.prototype = new $h_sci_HashSet();
$c_sci_HashSet$EmptyHashSet$.prototype.constructor = $c_sci_HashSet$EmptyHashSet$;
/** @constructor */
var $h_sci_HashSet$EmptyHashSet$ = (function() {
  /*<skip>*/
});
$h_sci_HashSet$EmptyHashSet$.prototype = $c_sci_HashSet$EmptyHashSet$.prototype;
var $d_sci_HashSet$EmptyHashSet$ = new $TypeData().initClass({
  sci_HashSet$EmptyHashSet$: 0
}, false, "scala.collection.immutable.HashSet$EmptyHashSet$", {
  sci_HashSet$EmptyHashSet$: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$EmptyHashSet$.prototype.$classData = $d_sci_HashSet$EmptyHashSet$;
var $n_sci_HashSet$EmptyHashSet$ = (void 0);
var $m_sci_HashSet$EmptyHashSet$ = (function() {
  if ((!$n_sci_HashSet$EmptyHashSet$)) {
    $n_sci_HashSet$EmptyHashSet$ = new $c_sci_HashSet$EmptyHashSet$().init___()
  };
  return $n_sci_HashSet$EmptyHashSet$
});
/** @constructor */
var $c_sci_HashSet$HashTrieSet = (function() {
  $c_sci_HashSet.call(this);
  this.bitmap$5 = 0;
  this.elems$5 = null;
  this.size0$5 = 0
});
$c_sci_HashSet$HashTrieSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$HashTrieSet.prototype.constructor = $c_sci_HashSet$HashTrieSet;
/** @constructor */
var $h_sci_HashSet$HashTrieSet = (function() {
  /*<skip>*/
});
$h_sci_HashSet$HashTrieSet.prototype = $c_sci_HashSet$HashTrieSet.prototype;
$c_sci_HashSet$HashTrieSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
  if (((this.bitmap$5 & mask) !== 0)) {
    var sub = this.elems$5.u[offset];
    var subNew = sub.updated0__O__I__I__sci_HashSet(key, hash, ((5 + level) | 0));
    if ((sub === subNew)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashSet.getArrayOf(), [this.elems$5.u["length"]]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew, 0, this.elems$5.u["length"]);
      elemsNew.u[offset] = subNew;
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(this.bitmap$5, elemsNew, ((this.size0$5 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [((1 + this.elems$5.u["length"]) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew$2, 0, offset);
    elemsNew$2.u[offset] = new $c_sci_HashSet$HashSet1().init___O__I(key, hash);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$5.u["length"] - offset) | 0));
    var bitmapNew = (this.bitmap$5 | mask);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmapNew, elemsNew$2, ((1 + this.size0$5) | 0))
  }
});
$c_sci_HashSet$HashTrieSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$5.u["length"])) {
    this.elems$5.u[i].foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashSet$HashTrieSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashSet$HashTrieSet$$anon$1().init___sci_HashSet$HashTrieSet(this)
});
$c_sci_HashSet$HashTrieSet.prototype.size__I = (function() {
  return this.size0$5
});
$c_sci_HashSet$HashTrieSet.prototype.init___I__Asci_HashSet__I = (function(bitmap, elems, size0) {
  this.bitmap$5 = bitmap;
  this.elems$5 = elems;
  this.size0$5 = size0;
  $m_s_Predef$().assert__Z__V(($m_jl_Integer$().bitCount__I__I(bitmap) === elems.u["length"]));
  return this
});
$c_sci_HashSet$HashTrieSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$5 === (-1))) {
    return this.elems$5.u[(31 & index)].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$5 & mask) !== 0)) {
    var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
    return this.elems$5.u[offset].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    return false
  }
});
$c_sci_HashSet$HashTrieSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  if ((that === this)) {
    return true
  } else {
    if ($is_sci_HashSet$HashTrieSet(that)) {
      var x2 = $as_sci_HashSet$HashTrieSet(that);
      if ((this.size0$5 <= x2.size0$5)) {
        var abm = this.bitmap$5;
        var a = this.elems$5;
        var ai = 0;
        var b = x2.elems$5;
        var bbm = x2.bitmap$5;
        var bi = 0;
        if (((abm & bbm) === abm)) {
          while ((abm !== 0)) {
            var alsb = (abm ^ (abm & (((-1) + abm) | 0)));
            var blsb = (bbm ^ (bbm & (((-1) + bbm) | 0)));
            if ((alsb === blsb)) {
              if ((!a.u[ai].subsetOf0__sci_HashSet__I__Z(b.u[bi], ((5 + level) | 0)))) {
                return false
              };
              abm = (abm & (~alsb));
              ai = ((1 + ai) | 0)
            };
            bbm = (bbm & (~blsb));
            bi = ((1 + bi) | 0)
          };
          return true
        } else {
          return false
        }
      }
    };
    return false
  }
});
var $is_sci_HashSet$HashTrieSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashTrieSet)))
});
var $as_sci_HashSet$HashTrieSet = (function(obj) {
  return (($is_sci_HashSet$HashTrieSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashTrieSet"))
});
var $isArrayOf_sci_HashSet$HashTrieSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashTrieSet)))
});
var $asArrayOf_sci_HashSet$HashTrieSet = (function(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashTrieSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashTrieSet;", depth))
});
var $d_sci_HashSet$HashTrieSet = new $TypeData().initClass({
  sci_HashSet$HashTrieSet: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet", {
  sci_HashSet$HashTrieSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashTrieSet.prototype.$classData = $d_sci_HashSet$HashTrieSet;
/** @constructor */
var $c_sci_HashSet$LeafHashSet = (function() {
  $c_sci_HashSet.call(this)
});
$c_sci_HashSet$LeafHashSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$LeafHashSet.prototype.constructor = $c_sci_HashSet$LeafHashSet;
/** @constructor */
var $h_sci_HashSet$LeafHashSet = (function() {
  /*<skip>*/
});
$h_sci_HashSet$LeafHashSet.prototype = $c_sci_HashSet$LeafHashSet.prototype;
/** @constructor */
var $c_sci_ListMap = (function() {
  $c_sci_AbstractMap.call(this)
});
$c_sci_ListMap.prototype = new $h_sci_AbstractMap();
$c_sci_ListMap.prototype.constructor = $c_sci_ListMap;
/** @constructor */
var $h_sci_ListMap = (function() {
  /*<skip>*/
});
$h_sci_ListMap.prototype = $c_sci_ListMap.prototype;
$c_sci_ListMap.prototype.value__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("empty map")
});
$c_sci_ListMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListMap.prototype.empty__sc_Map = (function() {
  return $m_sci_ListMap$EmptyListMap$()
});
$c_sci_ListMap.prototype.empty__sci_Map = (function() {
  return $m_sci_ListMap$EmptyListMap$()
});
$c_sci_ListMap.prototype.size__I = (function() {
  return 0
});
$c_sci_ListMap.prototype.seq__sc_Map = (function() {
  return this
});
$c_sci_ListMap.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_sci_ListMap$$anon$1().init___sci_ListMap(this);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  var this$3 = $as_sci_List($s_sc_TraversableOnce$class__to__sc_TraversableOnce__scg_CanBuildFrom__O(this$1, cbf));
  return $s_sc_SeqLike$class__reverseIterator__sc_SeqLike__sc_Iterator(this$3)
});
$c_sci_ListMap.prototype.key__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("empty map")
});
$c_sci_ListMap.prototype.updated__O__O__sci_ListMap = (function(key, value) {
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this, key, value)
});
$c_sci_ListMap.prototype.get__O__s_Option = (function(key) {
  return $m_s_None$()
});
$c_sci_ListMap.prototype.next__sci_ListMap = (function() {
  throw new $c_ju_NoSuchElementException().init___T("empty map")
});
$c_sci_ListMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_ListMap(kv.$$und1$f, kv.$$und2$f)
});
var $is_sci_ListMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListMap)))
});
var $as_sci_ListMap = (function(obj) {
  return (($is_sci_ListMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ListMap"))
});
var $isArrayOf_sci_ListMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListMap)))
});
var $asArrayOf_sci_ListMap = (function(obj, depth) {
  return (($isArrayOf_sci_ListMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ListMap;", depth))
});
/** @constructor */
var $c_sci_Map$EmptyMap$ = (function() {
  $c_sci_AbstractMap.call(this)
});
$c_sci_Map$EmptyMap$.prototype = new $h_sci_AbstractMap();
$c_sci_Map$EmptyMap$.prototype.constructor = $c_sci_Map$EmptyMap$;
/** @constructor */
var $h_sci_Map$EmptyMap$ = (function() {
  /*<skip>*/
});
$h_sci_Map$EmptyMap$.prototype = $c_sci_Map$EmptyMap$.prototype;
$c_sci_Map$EmptyMap$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Map$EmptyMap$.prototype.size__I = (function() {
  return 0
});
$c_sci_Map$EmptyMap$.prototype.get__O__s_Option = (function(key) {
  return $m_s_None$()
});
$c_sci_Map$EmptyMap$.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  var key = kv.$$und1$f;
  var value = kv.$$und2$f;
  return new $c_sci_Map$Map1().init___O__O(key, value)
});
var $d_sci_Map$EmptyMap$ = new $TypeData().initClass({
  sci_Map$EmptyMap$: 0
}, false, "scala.collection.immutable.Map$EmptyMap$", {
  sci_Map$EmptyMap$: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$EmptyMap$.prototype.$classData = $d_sci_Map$EmptyMap$;
var $n_sci_Map$EmptyMap$ = (void 0);
var $m_sci_Map$EmptyMap$ = (function() {
  if ((!$n_sci_Map$EmptyMap$)) {
    $n_sci_Map$EmptyMap$ = new $c_sci_Map$EmptyMap$().init___()
  };
  return $n_sci_Map$EmptyMap$
});
/** @constructor */
var $c_sci_Map$Map1 = (function() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null
});
$c_sci_Map$Map1.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map1.prototype.constructor = $c_sci_Map$Map1;
/** @constructor */
var $h_sci_Map$Map1 = (function() {
  /*<skip>*/
});
$h_sci_Map$Map1.prototype = $c_sci_Map$Map1.prototype;
$c_sci_Map$Map1.prototype.init___O__O = (function(key1, value1) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  return this
});
$c_sci_Map$Map1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5))
});
$c_sci_Map$Map1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5)]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_Map$Map1.prototype.size__I = (function() {
  return 1
});
$c_sci_Map$Map1.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map1().init___O__O(this.key1$5, value) : new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, key, value))
});
$c_sci_Map$Map1.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : $m_s_None$())
});
$c_sci_Map$Map1.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
var $d_sci_Map$Map1 = new $TypeData().initClass({
  sci_Map$Map1: 0
}, false, "scala.collection.immutable.Map$Map1", {
  sci_Map$Map1: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map1.prototype.$classData = $d_sci_Map$Map1;
/** @constructor */
var $c_sci_Map$Map2 = (function() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null
});
$c_sci_Map$Map2.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map2.prototype.constructor = $c_sci_Map$Map2;
/** @constructor */
var $h_sci_Map$Map2 = (function() {
  /*<skip>*/
});
$h_sci_Map$Map2.prototype = $c_sci_Map$Map2.prototype;
$c_sci_Map$Map2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5))
});
$c_sci_Map$Map2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5)]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_Map$Map2.prototype.size__I = (function() {
  return 2
});
$c_sci_Map$Map2.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value) : new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, key, value)))
});
$c_sci_Map$Map2.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : $m_s_None$()))
});
$c_sci_Map$Map2.prototype.init___O__O__O__O = (function(key1, value1, key2, value2) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  return this
});
$c_sci_Map$Map2.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
var $d_sci_Map$Map2 = new $TypeData().initClass({
  sci_Map$Map2: 0
}, false, "scala.collection.immutable.Map$Map2", {
  sci_Map$Map2: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map2.prototype.$classData = $d_sci_Map$Map2;
/** @constructor */
var $c_sci_Map$Map3 = (function() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null;
  this.key3$5 = null;
  this.value3$5 = null
});
$c_sci_Map$Map3.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map3.prototype.constructor = $c_sci_Map$Map3;
/** @constructor */
var $h_sci_Map$Map3 = (function() {
  /*<skip>*/
});
$h_sci_Map$Map3.prototype = $c_sci_Map$Map3.prototype;
$c_sci_Map$Map3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key3$5, this.value3$5))
});
$c_sci_Map$Map3.prototype.init___O__O__O__O__O__O = (function(key1, value1, key2, value2, key3, value3) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  this.key3$5 = key3;
  this.value3$5 = value3;
  return this
});
$c_sci_Map$Map3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5), new $c_T2().init___O__O(this.key3$5, this.value3$5)]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_Map$Map3.prototype.size__I = (function() {
  return 3
});
$c_sci_Map$Map3.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value) : new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, key, value))))
});
$c_sci_Map$Map3.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_s_Some().init___O(this.value3$5) : $m_s_None$())))
});
$c_sci_Map$Map3.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
var $d_sci_Map$Map3 = new $TypeData().initClass({
  sci_Map$Map3: 0
}, false, "scala.collection.immutable.Map$Map3", {
  sci_Map$Map3: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map3.prototype.$classData = $d_sci_Map$Map3;
/** @constructor */
var $c_sci_Map$Map4 = (function() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null;
  this.key3$5 = null;
  this.value3$5 = null;
  this.key4$5 = null;
  this.value4$5 = null
});
$c_sci_Map$Map4.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map4.prototype.constructor = $c_sci_Map$Map4;
/** @constructor */
var $h_sci_Map$Map4 = (function() {
  /*<skip>*/
});
$h_sci_Map$Map4.prototype = $c_sci_Map$Map4.prototype;
$c_sci_Map$Map4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key3$5, this.value3$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key4$5, this.value4$5))
});
$c_sci_Map$Map4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5), new $c_T2().init___O__O(this.key3$5, this.value3$5), new $c_T2().init___O__O(this.key4$5, this.value4$5)]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_Map$Map4.prototype.size__I = (function() {
  return 4
});
$c_sci_Map$Map4.prototype.init___O__O__O__O__O__O__O__O = (function(key1, value1, key2, value2, key3, value3, key4, value4) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  this.key3$5 = key3;
  this.value3$5 = value3;
  this.key4$5 = key4;
  this.value4$5 = value4;
  return this
});
$c_sci_Map$Map4.prototype.updated__O__O__sci_Map = (function(key, value) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, this.value4$5)
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
    return new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5, this.key4$5, this.value4$5)
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) {
    return new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value, this.key4$5, this.value4$5)
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5)) {
    return new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, value)
  } else {
    var this$1 = new $c_sci_HashMap().init___();
    var elem1 = new $c_T2().init___O__O(this.key1$5, this.value1$5);
    var elem2 = new $c_T2().init___O__O(this.key2$5, this.value2$5);
    var array = [new $c_T2().init___O__O(this.key3$5, this.value3$5), new $c_T2().init___O__O(this.key4$5, this.value4$5), new $c_T2().init___O__O(key, value)];
    var this$3 = this$1.$$plus__T2__sci_HashMap(elem1).$$plus__T2__sci_HashMap(elem2);
    var this$2 = $m_sci_HashMap$();
    var bf = new $c_scg_GenMapFactory$MapCanBuildFrom().init___scg_GenMapFactory(this$2);
    var this$4 = bf.$$outer$f;
    var b = new $c_scm_MapBuilder().init___sc_GenMap(this$4.empty__sc_GenMap());
    var delta = $uI(array["length"]);
    $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__I__V(b, this$3, delta);
    $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(b, this$3);
    matchEnd4: {
      var i = 0;
      var len = $uI(array["length"]);
      while ((i < len)) {
        var index = i;
        var arg1 = array[index];
        b.$$plus$eq__T2__scm_MapBuilder($as_T2(arg1));
        i = ((1 + i) | 0)
      };
      break matchEnd4
    };
    return $as_sci_HashMap(b.elems$1)
  }
});
$c_sci_Map$Map4.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_s_Some().init___O(this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new $c_s_Some().init___O(this.value4$5) : $m_s_None$()))))
});
$c_sci_Map$Map4.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1$f, kv.$$und2$f)
});
var $d_sci_Map$Map4 = new $TypeData().initClass({
  sci_Map$Map4: 0
}, false, "scala.collection.immutable.Map$Map4", {
  sci_Map$Map4: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map4.prototype.$classData = $d_sci_Map$Map4;
/** @constructor */
var $c_sci_HashMap = (function() {
  $c_sci_AbstractMap.call(this)
});
$c_sci_HashMap.prototype = new $h_sci_AbstractMap();
$c_sci_HashMap.prototype.constructor = $c_sci_HashMap;
/** @constructor */
var $h_sci_HashMap = (function() {
  /*<skip>*/
});
$h_sci_HashMap.prototype = $c_sci_HashMap.prototype;
$c_sci_HashMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashMap.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_ScalaRunTime$().hash__O__I(key))
});
$c_sci_HashMap.prototype.init___ = (function() {
  return this
});
$c_sci_HashMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashMap.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv)
});
$c_sci_HashMap.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return $m_s_None$()
});
$c_sci_HashMap.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashMap.prototype.$$plus__T2__sci_HashMap = (function(kv) {
  return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(kv.$$und1$f, this.computeHash__O__I(kv.$$und1$f), 0, kv.$$und2$f, kv, null)
});
$c_sci_HashMap.prototype.empty__sc_Map = (function() {
  $m_sci_HashMap$();
  return $m_sci_HashMap$EmptyHashMap$()
});
$c_sci_HashMap.prototype.empty__sci_Map = (function() {
  $m_sci_HashMap$();
  return $m_sci_HashMap$EmptyHashMap$()
});
$c_sci_HashMap.prototype.seq__sc_Map = (function() {
  return this
});
$c_sci_HashMap.prototype.size__I = (function() {
  return 0
});
$c_sci_HashMap.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashMap.prototype.get__O__s_Option = (function(key) {
  return this.get0__O__I__I__s_Option(key, this.computeHash__O__I(key), 0)
});
$c_sci_HashMap.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.$$plus__T2__sci_HashMap(kv)
});
var $is_sci_HashMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap)))
});
var $as_sci_HashMap = (function(obj) {
  return (($is_sci_HashMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap"))
});
var $isArrayOf_sci_HashMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap)))
});
var $asArrayOf_sci_HashMap = (function(obj, depth) {
  return (($isArrayOf_sci_HashMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap;", depth))
});
var $d_sci_HashMap = new $TypeData().initClass({
  sci_HashMap: 0
}, false, "scala.collection.immutable.HashMap", {
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap.prototype.$classData = $d_sci_HashMap;
/** @constructor */
var $c_sci_HashSet$HashSet1 = (function() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.key$6 = null;
  this.hash$6 = 0
});
$c_sci_HashSet$HashSet1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSet1.prototype.constructor = $c_sci_HashSet$HashSet1;
/** @constructor */
var $h_sci_HashSet$HashSet1 = (function() {
  /*<skip>*/
});
$h_sci_HashSet$HashSet1.prototype = $c_sci_HashSet$HashSet1.prototype;
$c_sci_HashSet$HashSet1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    return this
  } else if ((hash !== this.hash$6)) {
    return $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level)
  } else {
    var this$2 = $m_sci_ListSet$EmptyListSet$();
    var elem = this.key$6;
    return new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, new $c_sci_ListSet$Node().init___sci_ListSet__O(this$2, elem).$$plus__O__sci_ListSet(key))
  }
});
$c_sci_HashSet$HashSet1.prototype.init___O__I = (function(key, hash) {
  this.key$6 = key;
  this.hash$6 = hash;
  return this
});
$c_sci_HashSet$HashSet1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.key$6)
});
$c_sci_HashSet$HashSet1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.key$6]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_HashSet$HashSet1.prototype.size__I = (function() {
  return 1
});
$c_sci_HashSet$HashSet1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
$c_sci_HashSet$HashSet1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return that.get0__O__I__I__Z(this.key$6, this.hash$6, level)
});
var $is_sci_HashSet$HashSet1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashSet1)))
});
var $as_sci_HashSet$HashSet1 = (function(obj) {
  return (($is_sci_HashSet$HashSet1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashSet1"))
});
var $isArrayOf_sci_HashSet$HashSet1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashSet1)))
});
var $asArrayOf_sci_HashSet$HashSet1 = (function(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashSet1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashSet1;", depth))
});
var $d_sci_HashSet$HashSet1 = new $TypeData().initClass({
  sci_HashSet$HashSet1: 0
}, false, "scala.collection.immutable.HashSet$HashSet1", {
  sci_HashSet$HashSet1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSet1.prototype.$classData = $d_sci_HashSet$HashSet1;
/** @constructor */
var $c_sci_HashSet$HashSetCollision1 = (function() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.hash$6 = 0;
  this.ks$6 = null
});
$c_sci_HashSet$HashSetCollision1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSetCollision1.prototype.constructor = $c_sci_HashSet$HashSetCollision1;
/** @constructor */
var $h_sci_HashSet$HashSetCollision1 = (function() {
  /*<skip>*/
});
$h_sci_HashSet$HashSetCollision1.prototype = $c_sci_HashSet$HashSetCollision1.prototype;
$c_sci_HashSet$HashSetCollision1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return ((hash === this.hash$6) ? new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, this.ks$6.$$plus__O__sci_ListSet(key)) : $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level))
});
$c_sci_HashSet$HashSetCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.ks$6;
  var this$2 = new $c_sci_ListSet$$anon$1().init___sci_ListSet(this$1);
  $s_sc_Iterator$class__foreach__sc_Iterator__F1__V(this$2, f)
});
$c_sci_HashSet$HashSetCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.ks$6;
  return new $c_sci_ListSet$$anon$1().init___sci_ListSet(this$1)
});
$c_sci_HashSet$HashSetCollision1.prototype.size__I = (function() {
  return this.ks$6.size__I()
});
$c_sci_HashSet$HashSetCollision1.prototype.init___I__sci_ListSet = (function(hash, ks) {
  this.hash$6 = hash;
  this.ks$6 = ks;
  return this
});
$c_sci_HashSet$HashSetCollision1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.ks$6.contains__O__Z(key))
});
$c_sci_HashSet$HashSetCollision1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  var this$1 = this.ks$6;
  var this$2 = new $c_sci_ListSet$$anon$1().init___sci_ListSet(this$1);
  var res = true;
  while (true) {
    if (res) {
      var this$3 = this$2.that$2;
      var jsx$1 = $s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$3)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var arg1 = this$2.next__O();
      res = that.get0__O__I__I__Z(arg1, this.hash$6, level)
    } else {
      break
    }
  };
  return res
});
var $d_sci_HashSet$HashSetCollision1 = new $TypeData().initClass({
  sci_HashSet$HashSetCollision1: 0
}, false, "scala.collection.immutable.HashSet$HashSetCollision1", {
  sci_HashSet$HashSetCollision1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSetCollision1.prototype.$classData = $d_sci_HashSet$HashSetCollision1;
/** @constructor */
var $c_sci_List = (function() {
  $c_sc_AbstractSeq.call(this)
});
$c_sci_List.prototype = new $h_sc_AbstractSeq();
$c_sci_List.prototype.constructor = $c_sci_List;
/** @constructor */
var $h_sci_List = (function() {
  /*<skip>*/
});
$h_sci_List.prototype = $c_sci_List.prototype;
$c_sci_List.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_List.prototype.init___ = (function() {
  return this
});
$c_sci_List.prototype.apply__I__O = (function(n) {
  return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
$c_sci_List.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
$c_sci_List.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
$c_sci_List.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_sci_List.prototype.toList__sci_List = (function() {
  return this
});
$c_sci_List.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_List.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_List(n)
});
$c_sci_List.prototype.take__I__sci_List = (function(n) {
  if ((this.isEmpty__Z() || (n <= 0))) {
    return $m_sci_Nil$()
  } else {
    var h = new $c_sci_$colon$colon().init___O__sci_List(this.head__O(), $m_sci_Nil$());
    var t = h;
    var rest = this.tail__sci_List();
    var i = 1;
    while (true) {
      if (rest.isEmpty__Z()) {
        return this
      };
      if ((i < n)) {
        i = ((1 + i) | 0);
        var nx = new $c_sci_$colon$colon().init___O__sci_List(rest.head__O(), $m_sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$1 = rest;
        rest = this$1.tail__sci_List()
      } else {
        break
      }
    };
    return h
  }
});
$c_sci_List.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_List$()
});
$c_sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$1 = these;
    these = this$1.tail__sci_List()
  }
});
$c_sci_List.prototype.$$colon$colon$colon__sci_List__sci_List = (function(prefix) {
  return (this.isEmpty__Z() ? prefix : (prefix.isEmpty__Z() ? this : new $c_scm_ListBuffer().init___().$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(prefix).prependToList__sci_List__sci_List(this)))
});
$c_sci_List.prototype.reverse__O = (function() {
  return this.reverse__sci_List()
});
$c_sci_List.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
});
$c_sci_List.prototype.drop__I__sci_List = (function(n) {
  var these = this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    var this$1 = these;
    these = this$1.tail__sci_List();
    count = (((-1) + count) | 0)
  };
  return these
});
$c_sci_List.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.length__I = (function() {
  return $s_sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I(this)
});
$c_sci_List.prototype.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O = (function(that, bf) {
  return ((bf === $m_sci_List$().ReusableCBFInstance$2) ? that.seq__sc_TraversableOnce().toList__sci_List().$$colon$colon$colon__sci_List__sci_List(this) : $s_sc_TraversableLike$class__$$plus$plus__sc_TraversableLike__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that, bf))
});
$c_sci_List.prototype.take__I__O = (function(n) {
  return this.take__I__sci_List(n)
});
$c_sci_List.prototype.toStream__sci_Stream = (function() {
  return (this.isEmpty__Z() ? $m_sci_Stream$Empty$() : new $c_sci_Stream$Cons().init___O__F0(this.head__O(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      return this$2.tail__sci_List().toStream__sci_Stream()
    })
  })(this))))
});
$c_sci_List.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_List.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ((bf === $m_sci_List$().ReusableCBFInstance$2)) {
    if ((this === $m_sci_Nil$())) {
      return $m_sci_Nil$()
    } else {
      var h = new $c_sci_$colon$colon().init___O__sci_List(f.apply__O__O(this.head__O()), $m_sci_Nil$());
      var t = h;
      var rest = this.tail__sci_List();
      while ((rest !== $m_sci_Nil$())) {
        var nx = new $c_sci_$colon$colon().init___O__sci_List(f.apply__O__O(rest.head__O()), $m_sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$1 = rest;
        rest = this$1.tail__sci_List()
      };
      return h
    }
  } else {
    return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_List.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = $as_sc_LinearSeqLike(repr);
  return $as_sc_LinearSeq(repr$1)
});
$c_sci_List.prototype.reverse__sci_List = (function() {
  var result = $m_sci_Nil$();
  var these = this;
  while ((!these.isEmpty__Z())) {
    var x$4 = these.head__O();
    var this$1 = result;
    result = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    var this$2 = these;
    these = this$2.tail__sci_List()
  };
  return result
});
$c_sci_List.prototype.stringPrefix__T = (function() {
  return "List"
});
var $is_sci_List = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
});
var $as_sci_List = (function(obj) {
  return (($is_sci_List(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.List"))
});
var $isArrayOf_sci_List = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
});
var $asArrayOf_sci_List = (function(obj, depth) {
  return (($isArrayOf_sci_List(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
});
/** @constructor */
var $c_sci_ListMap$EmptyListMap$ = (function() {
  $c_sci_ListMap.call(this)
});
$c_sci_ListMap$EmptyListMap$.prototype = new $h_sci_ListMap();
$c_sci_ListMap$EmptyListMap$.prototype.constructor = $c_sci_ListMap$EmptyListMap$;
/** @constructor */
var $h_sci_ListMap$EmptyListMap$ = (function() {
  /*<skip>*/
});
$h_sci_ListMap$EmptyListMap$.prototype = $c_sci_ListMap$EmptyListMap$.prototype;
var $d_sci_ListMap$EmptyListMap$ = new $TypeData().initClass({
  sci_ListMap$EmptyListMap$: 0
}, false, "scala.collection.immutable.ListMap$EmptyListMap$", {
  sci_ListMap$EmptyListMap$: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListMap$EmptyListMap$.prototype.$classData = $d_sci_ListMap$EmptyListMap$;
var $n_sci_ListMap$EmptyListMap$ = (void 0);
var $m_sci_ListMap$EmptyListMap$ = (function() {
  if ((!$n_sci_ListMap$EmptyListMap$)) {
    $n_sci_ListMap$EmptyListMap$ = new $c_sci_ListMap$EmptyListMap$().init___()
  };
  return $n_sci_ListMap$EmptyListMap$
});
/** @constructor */
var $c_sci_ListMap$Node = (function() {
  $c_sci_ListMap.call(this);
  this.key$6 = null;
  this.value$6 = null;
  this.$$outer$f = null
});
$c_sci_ListMap$Node.prototype = new $h_sci_ListMap();
$c_sci_ListMap$Node.prototype.constructor = $c_sci_ListMap$Node;
/** @constructor */
var $h_sci_ListMap$Node = (function() {
  /*<skip>*/
});
$h_sci_ListMap$Node.prototype = $c_sci_ListMap$Node.prototype;
$c_sci_ListMap$Node.prototype.value__O = (function() {
  return this.value$6
});
$c_sci_ListMap$Node.prototype.apply__O__O = (function(k) {
  return this.apply0__p6__sci_ListMap__O__O(this, k)
});
$c_sci_ListMap$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListMap$Node.prototype.apply0__p6__sci_ListMap__O__O = (function(cur, k) {
  _apply0: while (true) {
    if (cur.isEmpty__Z()) {
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + k))
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      return cur.value__O()
    } else {
      cur = cur.next__sci_ListMap();
      continue _apply0
    }
  }
});
$c_sci_ListMap$Node.prototype.size0__p6__sci_ListMap__I__I = (function(cur, acc) {
  _size0: while (true) {
    if (cur.isEmpty__Z()) {
      return acc
    } else {
      var temp$cur = cur.next__sci_ListMap();
      var temp$acc = ((1 + acc) | 0);
      cur = temp$cur;
      acc = temp$acc;
      continue _size0
    }
  }
});
$c_sci_ListMap$Node.prototype.size__I = (function() {
  return this.size0__p6__sci_ListMap__I__I(this, 0)
});
$c_sci_ListMap$Node.prototype.key__O = (function() {
  return this.key$6
});
$c_sci_ListMap$Node.prototype.updated__O__O__sci_ListMap = (function(k, v) {
  var m = this.remove0__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, $m_sci_Nil$());
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(m, k, v)
});
$c_sci_ListMap$Node.prototype.get__O__s_Option = (function(k) {
  return this.get0__p6__sci_ListMap__O__s_Option(this, k)
});
$c_sci_ListMap$Node.prototype.get0__p6__sci_ListMap__O__s_Option = (function(cur, k) {
  _get0: while (true) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      return new $c_s_Some().init___O(cur.value__O())
    } else {
      var this$1 = cur.next__sci_ListMap();
      if ($s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
        cur = cur.next__sci_ListMap();
        continue _get0
      } else {
        return $m_s_None$()
      }
    }
  }
});
$c_sci_ListMap$Node.prototype.init___sci_ListMap__O__O = (function($$outer, key, value) {
  this.key$6 = key;
  this.value$6 = value;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
$c_sci_ListMap$Node.prototype.remove0__p6__O__sci_ListMap__sci_List__sci_ListMap = (function(k, cur, acc) {
  _remove0: while (true) {
    if (cur.isEmpty__Z()) {
      var this$1 = acc;
      return $as_sci_ListMap($s_sc_LinearSeqOptimized$class__last__sc_LinearSeqOptimized__O(this$1))
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      var x$4 = cur.next__sci_ListMap();
      var this$2 = acc;
      var acc$1 = x$4;
      var these = this$2;
      while ((!these.isEmpty__Z())) {
        var arg1 = acc$1;
        var arg2 = these.head__O();
        var x0$1 = $as_sci_ListMap(arg1);
        var x1$1 = $as_sci_ListMap(arg2);
        matchEnd3: {
          acc$1 = new $c_sci_ListMap$Node().init___sci_ListMap__O__O(x0$1, x1$1.key__O(), x1$1.value__O());
          break matchEnd3
        };
        these = $as_sc_LinearSeqOptimized(these.tail__O())
      };
      return $as_sci_ListMap(acc$1)
    } else {
      var temp$cur = cur.next__sci_ListMap();
      var x$5 = cur;
      var this$3 = acc;
      var temp$acc = new $c_sci_$colon$colon().init___O__sci_List(x$5, this$3);
      cur = temp$cur;
      acc = temp$acc;
      continue _remove0
    }
  }
});
$c_sci_ListMap$Node.prototype.next__sci_ListMap = (function() {
  return this.$$outer$f
});
var $d_sci_ListMap$Node = new $TypeData().initClass({
  sci_ListMap$Node: 0
}, false, "scala.collection.immutable.ListMap$Node", {
  sci_ListMap$Node: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListMap$Node.prototype.$classData = $d_sci_ListMap$Node;
/** @constructor */
var $c_sci_Stream = (function() {
  $c_sc_AbstractSeq.call(this)
});
$c_sci_Stream.prototype = new $h_sc_AbstractSeq();
$c_sci_Stream.prototype.constructor = $c_sci_Stream;
/** @constructor */
var $h_sci_Stream = (function() {
  /*<skip>*/
});
$h_sci_Stream.prototype = $c_sci_Stream.prototype;
$c_sci_Stream.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Stream.prototype.reverse__sci_Stream = (function() {
  var elem = $m_sci_Stream$Empty$();
  var result = new $c_sr_ObjectRef().init___O(elem);
  var these = this;
  while ((!these.isEmpty__Z())) {
    $m_sci_Stream$();
    var stream = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, result$1) {
      return (function() {
        return $as_sci_Stream(result$1.elem$1)
      })
    })(this, result));
    var r = new $c_sci_Stream$ConsWrapper().init___F0(stream).$$hash$colon$colon__O__sci_Stream(these.head__O());
    r.tail__O();
    result.elem$1 = r;
    these = $as_sci_Stream(these.tail__O())
  };
  return $as_sci_Stream(result.elem$1)
});
$c_sci_Stream.prototype.init___ = (function() {
  return this
});
$c_sci_Stream.prototype.apply__I__O = (function(n) {
  return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
$c_sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
$c_sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
$c_sci_Stream.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_sci_Stream.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Stream.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var nonEmptyPrefix = new $c_sr_ObjectRef().init___O(this);
      var prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream();
      while (((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z()) && prefix.isEmpty__Z())) {
        nonEmptyPrefix.elem$1 = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix.elem$1).tail__O());
        if ((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z())) {
          prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream()
        }
      };
      var x$1 = ($as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z() ? ($m_sci_Stream$(), $m_sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2$1, f$1, nonEmptyPrefix$1) {
        return (function() {
          var x = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix$1.elem$1).tail__O()).flatMap__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f, nonEmptyPrefix))))
    };
    return x$1
  } else {
    return $s_sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_Stream(n)
});
$c_sci_Stream.prototype.mkString__T__T = (function(sep) {
  return this.mkString__T__T__T__T("", sep, "")
});
$c_sci_Stream.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  this.force__sci_Stream();
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
$c_sci_Stream.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Stream$()
});
$c_sci_Stream.prototype.toString__T = (function() {
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, ("Stream" + "("), ", ", ")")
});
$c_sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  x: {
    _foreach: while (true) {
      if ((!_$this.isEmpty__Z())) {
        f.apply__O__O(_$this.head__O());
        _$this = $as_sci_Stream(_$this.tail__O());
        continue _foreach
      };
      break x
    }
  }
});
$c_sci_Stream.prototype.reverse__O = (function() {
  return this.reverse__sci_Stream()
});
$c_sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_StreamIterator().init___sci_Stream(this)
});
$c_sci_Stream.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.length__I = (function() {
  var len = 0;
  var left = this;
  while ((!left.isEmpty__Z())) {
    len = ((1 + len) | 0);
    left = $as_sci_Stream(left.tail__O())
  };
  return len
});
$c_sci_Stream.prototype.take__I__O = (function(n) {
  return this.take__I__sci_Stream(n)
});
$c_sci_Stream.prototype.toStream__sci_Stream = (function() {
  return this
});
$c_sci_Stream.prototype.drop__I__sci_Stream = (function(n) {
  var _$this = this;
  _drop: while (true) {
    if (((n <= 0) || _$this.isEmpty__Z())) {
      return _$this
    } else {
      var temp$_$this = $as_sci_Stream(_$this.tail__O());
      var temp$n = (((-1) + n) | 0);
      _$this = temp$_$this;
      n = temp$n;
      continue _drop
    }
  }
});
$c_sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  b.append__T__scm_StringBuilder(start);
  if ((!this.isEmpty__Z())) {
    b.append__O__scm_StringBuilder(this.head__O());
    var cursor = this;
    var n = 1;
    if (cursor.tailDefined__Z()) {
      var scout = $as_sci_Stream(this.tail__O());
      if (scout.isEmpty__Z()) {
        b.append__T__scm_StringBuilder(end);
        return b
      };
      if (((cursor !== scout) && scout.tailDefined__Z())) {
        cursor = scout;
        scout = $as_sci_Stream(scout.tail__O());
        while (((cursor !== scout) && scout.tailDefined__Z())) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O());
          scout = $as_sci_Stream(scout.tail__O());
          if (scout.tailDefined__Z()) {
            scout = $as_sci_Stream(scout.tail__O())
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = $as_sci_Stream(runner.tail__O());
          scout = $as_sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if (((cursor === scout) && (k > 0))) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        n = ((n - k) | 0)
      }
    };
    if ((!cursor.isEmpty__Z())) {
      if ((!cursor.tailDefined__Z())) {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
      } else {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
      }
    }
  };
  b.append__T__scm_StringBuilder(end);
  return b
});
$c_sci_Stream.prototype.force__sci_Stream = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = $as_sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = $as_sci_Stream(those.tail__O())
  };
  return this
});
$c_sci_Stream.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Stream.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var hd = f.apply__O__O(this.head__O());
      var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, f$1) {
        return (function() {
          var x = $as_sci_Stream(this$2.tail__O()).map__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f));
      var x$1 = new $c_sci_Stream$Cons().init___O__F0(hd, tl)
    };
    return x$1
  } else {
    return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.take__I__sci_Stream = (function(n) {
  if (((n <= 0) || this.isEmpty__Z())) {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
  } else if ((n === 1)) {
    var hd = this.head__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
      return (function() {
        $m_sci_Stream$();
        return $m_sci_Stream$Empty$()
      })
    })(this));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    var hd$1 = this.head__O();
    var tl$1 = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$3$1, n$1) {
      return (function() {
        return $as_sci_Stream(this$3$1.tail__O()).take__I__sci_Stream((((-1) + n$1) | 0))
      })
    })(this, n));
    return new $c_sci_Stream$Cons().init___O__F0(hd$1, tl$1)
  }
});
$c_sci_Stream.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = $as_sc_LinearSeqLike(repr);
  return $as_sc_LinearSeq(repr$1)
});
$c_sci_Stream.prototype.append__F0__sci_Stream = (function(rest) {
  if (this.isEmpty__Z()) {
    return $as_sc_GenTraversableOnce(rest.apply__O()).toStream__sci_Stream()
  } else {
    var hd = this.head__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, rest$1) {
      return (function() {
        return $as_sci_Stream(this$2.tail__O()).append__F0__sci_Stream(rest$1)
      })
    })(this, rest));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  }
});
$c_sci_Stream.prototype.stringPrefix__T = (function() {
  return "Stream"
});
var $is_sci_Stream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
});
var $as_sci_Stream = (function(obj) {
  return (($is_sci_Stream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream"))
});
var $isArrayOf_sci_Stream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
});
var $asArrayOf_sci_Stream = (function(obj, depth) {
  return (($isArrayOf_sci_Stream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
});
/** @constructor */
var $c_sci_HashMap$EmptyHashMap$ = (function() {
  $c_sci_HashMap.call(this)
});
$c_sci_HashMap$EmptyHashMap$.prototype = new $h_sci_HashMap();
$c_sci_HashMap$EmptyHashMap$.prototype.constructor = $c_sci_HashMap$EmptyHashMap$;
/** @constructor */
var $h_sci_HashMap$EmptyHashMap$ = (function() {
  /*<skip>*/
});
$h_sci_HashMap$EmptyHashMap$.prototype = $c_sci_HashMap$EmptyHashMap$.prototype;
var $d_sci_HashMap$EmptyHashMap$ = new $TypeData().initClass({
  sci_HashMap$EmptyHashMap$: 0
}, false, "scala.collection.immutable.HashMap$EmptyHashMap$", {
  sci_HashMap$EmptyHashMap$: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$EmptyHashMap$.prototype.$classData = $d_sci_HashMap$EmptyHashMap$;
var $n_sci_HashMap$EmptyHashMap$ = (void 0);
var $m_sci_HashMap$EmptyHashMap$ = (function() {
  if ((!$n_sci_HashMap$EmptyHashMap$)) {
    $n_sci_HashMap$EmptyHashMap$ = new $c_sci_HashMap$EmptyHashMap$().init___()
  };
  return $n_sci_HashMap$EmptyHashMap$
});
/** @constructor */
var $c_sci_HashMap$HashMap1 = (function() {
  $c_sci_HashMap.call(this);
  this.key$6 = null;
  this.hash$6 = 0;
  this.value$6 = null;
  this.kv$6 = null
});
$c_sci_HashMap$HashMap1.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashMap1.prototype.constructor = $c_sci_HashMap$HashMap1;
/** @constructor */
var $h_sci_HashMap$HashMap1 = (function() {
  /*<skip>*/
});
$h_sci_HashMap$HashMap1.prototype = $c_sci_HashMap$HashMap1.prototype;
$c_sci_HashMap$HashMap1.prototype.ensurePair__T2 = (function() {
  if ((this.kv$6 !== null)) {
    return this.kv$6
  } else {
    this.kv$6 = new $c_T2().init___O__O(this.key$6, this.value$6);
    return this.kv$6
  }
});
$c_sci_HashMap$HashMap1.prototype.init___O__I__O__T2 = (function(key, hash, value, kv) {
  this.key$6 = key;
  this.hash$6 = hash;
  this.value$6 = value;
  this.kv$6 = kv;
  return this
});
$c_sci_HashMap$HashMap1.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    if ((merger === null)) {
      return ((this.value$6 === value) ? this : new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv))
    } else {
      var nkv = merger.apply__T2__T2__T2(this.kv$6, kv);
      return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(nkv.$$und1$f, hash, nkv.$$und2$f, nkv)
    }
  } else if ((hash !== this.hash$6)) {
    var that = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    return $m_sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, 2)
  } else {
    var this$2 = $m_sci_ListMap$EmptyListMap$();
    var key$1 = this.key$6;
    var value$1 = this.value$6;
    return new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this$2, key$1, value$1).updated__O__O__sci_ListMap(key, value))
  }
});
$c_sci_HashMap$HashMap1.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6)) ? new $c_s_Some().init___O(this.value$6) : $m_s_None$())
});
$c_sci_HashMap$HashMap1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.ensurePair__T2())
});
$c_sci_HashMap$HashMap1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.ensurePair__T2()]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6["length"]))
});
$c_sci_HashMap$HashMap1.prototype.size__I = (function() {
  return 1
});
var $is_sci_HashMap$HashMap1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashMap1)))
});
var $as_sci_HashMap$HashMap1 = (function(obj) {
  return (($is_sci_HashMap$HashMap1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashMap1"))
});
var $isArrayOf_sci_HashMap$HashMap1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashMap1)))
});
var $asArrayOf_sci_HashMap$HashMap1 = (function(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashMap1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashMap1;", depth))
});
var $d_sci_HashMap$HashMap1 = new $TypeData().initClass({
  sci_HashMap$HashMap1: 0
}, false, "scala.collection.immutable.HashMap$HashMap1", {
  sci_HashMap$HashMap1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashMap1.prototype.$classData = $d_sci_HashMap$HashMap1;
/** @constructor */
var $c_sci_HashMap$HashMapCollision1 = (function() {
  $c_sci_HashMap.call(this);
  this.hash$6 = 0;
  this.kvs$6 = null
});
$c_sci_HashMap$HashMapCollision1.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashMapCollision1.prototype.constructor = $c_sci_HashMap$HashMapCollision1;
/** @constructor */
var $h_sci_HashMap$HashMapCollision1 = (function() {
  /*<skip>*/
});
$h_sci_HashMap$HashMapCollision1.prototype = $c_sci_HashMap$HashMapCollision1.prototype;
$c_sci_HashMap$HashMapCollision1.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  if ((hash === this.hash$6)) {
    if ((merger === null)) {
      var jsx$1 = true
    } else {
      var this$1 = this.kvs$6;
      var jsx$1 = (!$s_sc_MapLike$class__contains__sc_MapLike__O__Z(this$1, key))
    };
    if (jsx$1) {
      return new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this.kvs$6.updated__O__O__sci_ListMap(key, value))
    } else {
      var this$2 = this.kvs$6;
      var kv$1 = merger.apply__T2__T2__T2(new $c_T2().init___O__O(key, this.kvs$6.apply__O__O(key)), kv);
      return new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this$2.updated__O__O__sci_ListMap(kv$1.$$und1$f, kv$1.$$und2$f))
    }
  } else {
    var that = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    return $m_sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, ((1 + this.kvs$6.size__I()) | 0))
  }
});
$c_sci_HashMap$HashMapCollision1.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return ((hash === this.hash$6) ? this.kvs$6.get__O__s_Option(key) : $m_s_None$())
});
$c_sci_HashMap$HashMapCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.kvs$6;
  var this$2 = this$1.iterator__sc_Iterator();
  $s_sc_Iterator$class__foreach__sc_Iterator__F1__V(this$2, f)
});
$c_sci_HashMap$HashMapCollision1.prototype.iterator__sc_Iterator = (function() {
  return this.kvs$6.iterator__sc_Iterator()
});
$c_sci_HashMap$HashMapCollision1.prototype.size__I = (function() {
  return this.kvs$6.size__I()
});
$c_sci_HashMap$HashMapCollision1.prototype.init___I__sci_ListMap = (function(hash, kvs) {
  this.hash$6 = hash;
  this.kvs$6 = kvs;
  return this
});
var $d_sci_HashMap$HashMapCollision1 = new $TypeData().initClass({
  sci_HashMap$HashMapCollision1: 0
}, false, "scala.collection.immutable.HashMap$HashMapCollision1", {
  sci_HashMap$HashMapCollision1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashMapCollision1.prototype.$classData = $d_sci_HashMap$HashMapCollision1;
/** @constructor */
var $c_sci_HashMap$HashTrieMap = (function() {
  $c_sci_HashMap.call(this);
  this.bitmap$6 = 0;
  this.elems$6 = null;
  this.size0$6 = 0
});
$c_sci_HashMap$HashTrieMap.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashTrieMap.prototype.constructor = $c_sci_HashMap$HashTrieMap;
/** @constructor */
var $h_sci_HashMap$HashTrieMap = (function() {
  /*<skip>*/
});
$h_sci_HashMap$HashTrieMap.prototype = $c_sci_HashMap$HashTrieMap.prototype;
$c_sci_HashMap$HashTrieMap.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
  if (((this.bitmap$6 & mask) !== 0)) {
    var sub = this.elems$6.u[offset];
    var subNew = sub.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, ((5 + level) | 0), value, kv, merger);
    if ((subNew === sub)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashMap.getArrayOf(), [this.elems$6.u["length"]]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew, 0, this.elems$6.u["length"]);
      elemsNew.u[offset] = subNew;
      return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(this.bitmap$6, elemsNew, ((this.size0$6 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [((1 + this.elems$6.u["length"]) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew$2, 0, offset);
    elemsNew$2.u[offset] = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$6.u["length"] - offset) | 0));
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I((this.bitmap$6 | mask), elemsNew$2, ((1 + this.size0$6) | 0))
  }
});
$c_sci_HashMap$HashTrieMap.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$6 === (-1))) {
    return this.elems$6.u[(31 & index)].get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$6 & mask) !== 0)) {
    var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
    return this.elems$6.u[offset].get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
  } else {
    return $m_s_None$()
  }
});
$c_sci_HashMap$HashTrieMap.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$6.u["length"])) {
    this.elems$6.u[i].foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashMap$HashTrieMap.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashMap$HashTrieMap$$anon$1().init___sci_HashMap$HashTrieMap(this)
});
$c_sci_HashMap$HashTrieMap.prototype.size__I = (function() {
  return this.size0$6
});
$c_sci_HashMap$HashTrieMap.prototype.init___I__Asci_HashMap__I = (function(bitmap, elems, size0) {
  this.bitmap$6 = bitmap;
  this.elems$6 = elems;
  this.size0$6 = size0;
  return this
});
var $is_sci_HashMap$HashTrieMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashTrieMap)))
});
var $as_sci_HashMap$HashTrieMap = (function(obj) {
  return (($is_sci_HashMap$HashTrieMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashTrieMap"))
});
var $isArrayOf_sci_HashMap$HashTrieMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashTrieMap)))
});
var $asArrayOf_sci_HashMap$HashTrieMap = (function(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashTrieMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashTrieMap;", depth))
});
var $d_sci_HashMap$HashTrieMap = new $TypeData().initClass({
  sci_HashMap$HashTrieMap: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap", {
  sci_HashMap$HashTrieMap: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashTrieMap.prototype.$classData = $d_sci_HashMap$HashTrieMap;
/** @constructor */
var $c_sci_Stream$Cons = (function() {
  $c_sci_Stream.call(this);
  this.hd$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
});
$c_sci_Stream$Cons.prototype = new $h_sci_Stream();
$c_sci_Stream$Cons.prototype.constructor = $c_sci_Stream$Cons;
/** @constructor */
var $h_sci_Stream$Cons = (function() {
  /*<skip>*/
});
$h_sci_Stream$Cons.prototype = $c_sci_Stream$Cons.prototype;
$c_sci_Stream$Cons.prototype.head__O = (function() {
  return this.hd$5
});
$c_sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = $as_sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
$c_sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
$c_sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
$c_sci_Stream$Cons.prototype.init___O__F0 = (function(hd, tl) {
  this.hd$5 = hd;
  this.tlGen$5 = tl;
  return this
});
var $d_sci_Stream$Cons = new $TypeData().initClass({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Cons.prototype.$classData = $d_sci_Stream$Cons;
/** @constructor */
var $c_sci_Stream$Empty$ = (function() {
  $c_sci_Stream.call(this)
});
$c_sci_Stream$Empty$.prototype = new $h_sci_Stream();
$c_sci_Stream$Empty$.prototype.constructor = $c_sci_Stream$Empty$;
/** @constructor */
var $h_sci_Stream$Empty$ = (function() {
  /*<skip>*/
});
$h_sci_Stream$Empty$.prototype = $c_sci_Stream$Empty$.prototype;
$c_sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
$c_sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Stream$Empty$.prototype.tail__sr_Nothing$ = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty stream")
});
$c_sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty stream")
});
$c_sci_Stream$Empty$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
var $d_sci_Stream$Empty$ = new $TypeData().initClass({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Empty$.prototype.$classData = $d_sci_Stream$Empty$;
var $n_sci_Stream$Empty$ = (void 0);
var $m_sci_Stream$Empty$ = (function() {
  if ((!$n_sci_Stream$Empty$)) {
    $n_sci_Stream$Empty$ = new $c_sci_Stream$Empty$().init___()
  };
  return $n_sci_Stream$Empty$
});
/** @constructor */
var $c_sci_Vector = (function() {
  $c_sc_AbstractSeq.call(this);
  this.startIndex$4 = 0;
  this.endIndex$4 = 0;
  this.focus$4 = 0;
  this.dirty$4 = false;
  this.depth$4 = 0;
  this.display0$4 = null;
  this.display1$4 = null;
  this.display2$4 = null;
  this.display3$4 = null;
  this.display4$4 = null;
  this.display5$4 = null
});
$c_sci_Vector.prototype = new $h_sc_AbstractSeq();
$c_sci_Vector.prototype.constructor = $c_sci_Vector;
/** @constructor */
var $h_sci_Vector = (function() {
  /*<skip>*/
});
$h_sci_Vector.prototype = $c_sci_Vector.prototype;
$c_sci_Vector.prototype.checkRangeConvert__p4__I__I = (function(index) {
  var idx = ((index + this.startIndex$4) | 0);
  if (((index >= 0) && (idx < this.endIndex$4))) {
    return idx
  } else {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + index))
  }
});
$c_sci_Vector.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Vector.prototype.display3__AO = (function() {
  return this.display3$4
});
$c_sci_Vector.prototype.apply__I__O = (function(index) {
  var idx = this.checkRangeConvert__p4__I__I(index);
  var xor = (idx ^ this.focus$4);
  return $s_sci_VectorPointer$class__getElem__sci_VectorPointer__I__I__O(this, idx, xor)
});
$c_sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  return ((this.length__I() - len) | 0)
});
$c_sci_Vector.prototype.depth__I = (function() {
  return this.depth$4
});
$c_sci_Vector.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_sci_Vector.prototype.initIterator__sci_VectorIterator__V = (function(s) {
  var depth = this.depth$4;
  $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  if (this.dirty$4) {
    var index = this.focus$4;
    $s_sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V(s, index)
  };
  if ((s.depth$2 > 1)) {
    var index$1 = this.startIndex$4;
    var xor = (this.startIndex$4 ^ this.focus$4);
    $s_sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V(s, index$1, xor)
  }
});
$c_sci_Vector.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Vector.prototype.init___I__I__I = (function(startIndex, endIndex, focus) {
  this.startIndex$4 = startIndex;
  this.endIndex$4 = endIndex;
  this.focus$4 = focus;
  this.dirty$4 = false;
  return this
});
$c_sci_Vector.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$4 = x$1
});
$c_sci_Vector.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Vector$()
});
$c_sci_Vector.prototype.display0__AO = (function() {
  return this.display0$4
});
$c_sci_Vector.prototype.display4__AO = (function() {
  return this.display4$4
});
$c_sci_Vector.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$4 = x$1
});
$c_sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return this.iterator__sci_VectorIterator()
});
$c_sci_Vector.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$4 = x$1
});
$c_sci_Vector.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.length__I = (function() {
  return ((this.endIndex$4 - this.startIndex$4) | 0)
});
$c_sci_Vector.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$4 = x$1
});
$c_sci_Vector.prototype.display1__AO = (function() {
  return this.display1$4
});
$c_sci_Vector.prototype.display5__AO = (function() {
  return this.display5$4
});
$c_sci_Vector.prototype.iterator__sci_VectorIterator = (function() {
  var s = new $c_sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
  this.initIterator__sci_VectorIterator__V(s);
  return s
});
$c_sci_Vector.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Vector.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$4 = x$1
});
$c_sci_Vector.prototype.display2__AO = (function() {
  return this.display2$4
});
$c_sci_Vector.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$4 = x$1
});
$c_sci_Vector.prototype.toCollection__O__sc_Seq = (function(repr) {
  return $as_sc_IndexedSeq(repr)
});
$c_sci_Vector.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$4 = x$1
});
var $d_sci_Vector = new $TypeData().initClass({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_Vector.prototype.$classData = $d_sci_Vector;
/** @constructor */
var $c_sci_WrappedString = (function() {
  $c_sc_AbstractSeq.call(this);
  this.self$4 = null
});
$c_sci_WrappedString.prototype = new $h_sc_AbstractSeq();
$c_sci_WrappedString.prototype.constructor = $c_sci_WrappedString;
/** @constructor */
var $h_sci_WrappedString = (function() {
  /*<skip>*/
});
$h_sci_WrappedString.prototype = $c_sci_WrappedString.prototype;
$c_sci_WrappedString.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_WrappedString.prototype.apply__I__O = (function(idx) {
  var thiz = this.self$4;
  var c = (65535 & $uI(thiz["charCodeAt"](idx)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
$c_sci_WrappedString.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  var thiz = this.self$4;
  var c = (65535 & $uI(thiz["charCodeAt"](n)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_sci_WrappedString.prototype.isEmpty__Z = (function() {
  return $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
$c_sci_WrappedString.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_WrappedString.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_IndexedSeq$()
});
$c_sci_WrappedString.prototype.toString__T = (function() {
  return this.self$4
});
$c_sci_WrappedString.prototype.foreach__F1__V = (function(f) {
  $s_sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
$c_sci_WrappedString.prototype.reverse__O = (function() {
  return $s_sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
$c_sci_WrappedString.prototype.iterator__sc_Iterator = (function() {
  var thiz = this.self$4;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(thiz["length"]))
});
$c_sci_WrappedString.prototype.length__I = (function() {
  var thiz = this.self$4;
  return $uI(thiz["length"])
});
$c_sci_WrappedString.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_WrappedString.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
$c_sci_WrappedString.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_WrappedString.prototype.init___T = (function(self) {
  this.self$4 = self;
  return this
});
$c_sci_WrappedString.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = $as_sci_WrappedString(repr);
  return repr$1
});
$c_sci_WrappedString.prototype.newBuilder__scm_Builder = (function() {
  return $m_sci_WrappedString$().newBuilder__scm_Builder()
});
var $is_sci_WrappedString = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_WrappedString)))
});
var $as_sci_WrappedString = (function(obj) {
  return (($is_sci_WrappedString(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.WrappedString"))
});
var $isArrayOf_sci_WrappedString = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_WrappedString)))
});
var $asArrayOf_sci_WrappedString = (function(obj, depth) {
  return (($isArrayOf_sci_WrappedString(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.WrappedString;", depth))
});
var $d_sci_WrappedString = new $TypeData().initClass({
  sci_WrappedString: 0
}, false, "scala.collection.immutable.WrappedString", {
  sci_WrappedString: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_WrappedString.prototype.$classData = $d_sci_WrappedString;
/** @constructor */
var $c_sci_$colon$colon = (function() {
  $c_sci_List.call(this);
  this.head$5 = null;
  this.tl$5 = null
});
$c_sci_$colon$colon.prototype = new $h_sci_List();
$c_sci_$colon$colon.prototype.constructor = $c_sci_$colon$colon;
/** @constructor */
var $h_sci_$colon$colon = (function() {
  /*<skip>*/
});
$h_sci_$colon$colon.prototype = $c_sci_$colon$colon.prototype;
$c_sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
$c_sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
$c_sci_$colon$colon.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_$colon$colon.prototype.tail__sci_List = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.head$5;
      break
    }
    case 1: {
      return this.tl$5;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sci_$colon$colon.prototype.tail__O = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.init___O__sci_List = (function(head, tl) {
  this.head$5 = head;
  this.tl$5 = tl;
  return this
});
$c_sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_$colon$colon = new $TypeData().initClass({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1,
  s_Serializable: 1
});
$c_sci_$colon$colon.prototype.$classData = $d_sci_$colon$colon;
/** @constructor */
var $c_sci_Nil$ = (function() {
  $c_sci_List.call(this)
});
$c_sci_Nil$.prototype = new $h_sci_List();
$c_sci_Nil$.prototype.constructor = $c_sci_Nil$;
/** @constructor */
var $h_sci_Nil$ = (function() {
  /*<skip>*/
});
$h_sci_Nil$.prototype = $c_sci_Nil$.prototype;
$c_sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
$c_sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
$c_sci_Nil$.prototype.equals__O__Z = (function(that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return x2.isEmpty__Z()
  } else {
    return false
  }
});
$c_sci_Nil$.prototype.tail__sci_List = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty list")
});
$c_sci_Nil$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  matchEnd3: {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
  }
});
$c_sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty list")
});
$c_sci_Nil$.prototype.tail__O = (function() {
  return this.tail__sci_List()
});
$c_sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_Nil$ = new $TypeData().initClass({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1,
  s_Serializable: 1
});
$c_sci_Nil$.prototype.$classData = $d_sci_Nil$;
var $n_sci_Nil$ = (void 0);
var $m_sci_Nil$ = (function() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$().init___()
  };
  return $n_sci_Nil$
});
/** @constructor */
var $c_scm_AbstractSet = (function() {
  $c_scm_AbstractIterable.call(this)
});
$c_scm_AbstractSet.prototype = new $h_scm_AbstractIterable();
$c_scm_AbstractSet.prototype.constructor = $c_scm_AbstractSet;
/** @constructor */
var $h_scm_AbstractSet = (function() {
  /*<skip>*/
});
$h_scm_AbstractSet.prototype = $c_scm_AbstractSet.prototype;
$c_scm_AbstractSet.prototype.isEmpty__Z = (function() {
  return $s_sc_SetLike$class__isEmpty__sc_SetLike__Z(this)
});
$c_scm_AbstractSet.prototype.equals__O__Z = (function(that) {
  return $s_sc_GenSetLike$class__equals__sc_GenSetLike__O__Z(this, that)
});
$c_scm_AbstractSet.prototype.toString__T = (function() {
  return $s_sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
$c_scm_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  var this$1 = new $c_scm_FlatHashTable$$anon$1().init___scm_FlatHashTable(this);
  return $s_sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, that)
});
$c_scm_AbstractSet.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
$c_scm_AbstractSet.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_AbstractSet.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
});
$c_scm_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
$c_scm_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_HashSet().init___()
});
$c_scm_AbstractSet.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
var $c_scm_AbstractBuffer = (function() {
  $c_scm_AbstractSeq.call(this)
});
$c_scm_AbstractBuffer.prototype = new $h_scm_AbstractSeq();
$c_scm_AbstractBuffer.prototype.constructor = $c_scm_AbstractBuffer;
/** @constructor */
var $h_scm_AbstractBuffer = (function() {
  /*<skip>*/
});
$h_scm_AbstractBuffer.prototype = $c_scm_AbstractBuffer.prototype;
$c_scm_AbstractBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
var $c_scm_HashSet = (function() {
  $c_scm_AbstractSet.call(this);
  this.$$undloadFactor$5 = 0;
  this.table$5 = null;
  this.tableSize$5 = 0;
  this.threshold$5 = 0;
  this.sizemap$5 = null;
  this.seedvalue$5 = 0
});
$c_scm_HashSet.prototype = new $h_scm_AbstractSet();
$c_scm_HashSet.prototype.constructor = $c_scm_HashSet;
/** @constructor */
var $h_scm_HashSet = (function() {
  /*<skip>*/
});
$h_scm_HashSet.prototype = $c_scm_HashSet.prototype;
$c_scm_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_HashSet.prototype.init___ = (function() {
  $c_scm_HashSet.prototype.init___scm_FlatHashTable$Contents.call(this, null);
  return this
});
$c_scm_HashSet.prototype.apply__O__O = (function(v1) {
  return $s_scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z(this, v1)
});
$c_scm_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_HashSet.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_HashSet(elem)
});
$c_scm_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_HashSet$()
});
$c_scm_HashSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  var len = this.table$5.u["length"];
  while ((i < len)) {
    var curEntry = this.table$5.u[i];
    if ((curEntry !== null)) {
      f.apply__O__O($s_scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O(this, curEntry))
    };
    i = ((1 + i) | 0)
  }
});
$c_scm_HashSet.prototype.size__I = (function() {
  return this.tableSize$5
});
$c_scm_HashSet.prototype.result__O = (function() {
  return this
});
$c_scm_HashSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_FlatHashTable$$anon$1().init___scm_FlatHashTable(this)
});
$c_scm_HashSet.prototype.init___scm_FlatHashTable$Contents = (function(contents) {
  $s_scm_FlatHashTable$class__$$init$__scm_FlatHashTable__V(this);
  $s_scm_FlatHashTable$class__initWithContents__scm_FlatHashTable__scm_FlatHashTable$Contents__V(this, contents);
  return this
});
$c_scm_HashSet.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_HashSet(elem)
});
$c_scm_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  var this$1 = new $c_scm_HashSet().init___();
  var this$2 = $as_scm_HashSet($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this$1, this));
  return this$2.$$plus$eq__O__scm_HashSet(elem)
});
$c_scm_HashSet.prototype.$$plus$eq__O__scm_HashSet = (function(elem) {
  $s_scm_FlatHashTable$class__addElem__scm_FlatHashTable__O__Z(this, elem);
  return this
});
var $is_scm_HashSet = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_HashSet)))
});
var $as_scm_HashSet = (function(obj) {
  return (($is_scm_HashSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.HashSet"))
});
var $isArrayOf_scm_HashSet = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_HashSet)))
});
var $asArrayOf_scm_HashSet = (function(obj, depth) {
  return (($isArrayOf_scm_HashSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.HashSet;", depth))
});
var $d_scm_HashSet = new $TypeData().initClass({
  scm_HashSet: 0
}, false, "scala.collection.mutable.HashSet", {
  scm_HashSet: 1,
  scm_AbstractSet: 1,
  scm_AbstractIterable: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_Set: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  scm_SetLike: 1,
  sc_script_Scriptable: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_FlatHashTable: 1,
  scm_FlatHashTable$HashUtils: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_HashSet.prototype.$classData = $d_scm_HashSet;
/** @constructor */
var $c_scm_ListBuffer = (function() {
  $c_scm_AbstractBuffer.call(this);
  this.scala$collection$mutable$ListBuffer$$start$6 = null;
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
$c_scm_ListBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ListBuffer.prototype.constructor = $c_scm_ListBuffer;
/** @constructor */
var $h_scm_ListBuffer = (function() {
  /*<skip>*/
});
$h_scm_ListBuffer.prototype = $c_scm_ListBuffer.prototype;
$c_scm_ListBuffer.prototype.copy__p6__V = (function() {
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    return (void 0)
  };
  var cursor = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$1 = this.last0$6;
  var limit = this$1.tl$5;
  this.clear__V();
  while ((cursor !== limit)) {
    this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
    var this$2 = cursor;
    cursor = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.init___ = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.exported$6 = false;
  this.len$6 = 0;
  return this
});
$c_scm_ListBuffer.prototype.apply__I__O = (function(n) {
  if (((n < 0) || (n >= this.len$6))) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  } else {
    var this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this$2, n)
  }
});
$c_scm_ListBuffer.prototype.lengthCompare__I__I = (function(len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this$1, len)
});
$c_scm_ListBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this$1, that)
});
$c_scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()
});
$c_scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.exported$6 = (!this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z());
  return this.scala$collection$mutable$ListBuffer$$start$6
});
$c_scm_ListBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ListBuffer.prototype.equals__O__Z = (function(that) {
  if ($is_scm_ListBuffer(that)) {
    var x2 = $as_scm_ListBuffer(that);
    return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
  } else {
    return $s_sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
  }
});
$c_scm_ListBuffer.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, sep, end)
});
$c_scm_ListBuffer.prototype.mkString__T__T = (function(sep) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, "", sep, "")
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ListBuffer$()
});
$c_scm_ListBuffer.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.size__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
$c_scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
});
$c_scm_ListBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ListBuffer.prototype.length__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ListBuffer.prototype.toStream__sci_Stream = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
});
$c_scm_ListBuffer.prototype.prependToList__sci_List__sci_List = (function(xs) {
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    return xs
  } else {
    if (this.exported$6) {
      this.copy__p6__V()
    };
    this.last0$6.tl$5 = xs;
    return this.toList__sci_List()
  }
});
$c_scm_ListBuffer.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_ListBuffer = (function(x) {
  if (this.exported$6) {
    this.copy__p6__V()
  };
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
  } else {
    var last1 = this.last0$6;
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    last1.tl$5 = this.last0$6
  };
  this.len$6 = ((1 + this.len$6) | 0);
  return this
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_ListBuffer.prototype.clear__V = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer = (function(xs) {
  _$plus$plus$eq: while (true) {
    var x1 = xs;
    if ((x1 !== null)) {
      if ((x1 === this)) {
        var n = this.len$6;
        xs = $as_sc_TraversableOnce($s_sc_IterableLike$class__take__sc_IterableLike__I__O(this, n));
        continue _$plus$plus$eq
      }
    };
    return $as_scm_ListBuffer($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
});
$c_scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
var $is_scm_ListBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
});
var $as_scm_ListBuffer = (function(obj) {
  return (($is_scm_ListBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
});
var $isArrayOf_scm_ListBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
});
var $asArrayOf_scm_ListBuffer = (function(obj, depth) {
  return (($isArrayOf_scm_ListBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
});
var $d_scm_ListBuffer = new $TypeData().initClass({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer.prototype.$classData = $d_scm_ListBuffer;
/** @constructor */
var $c_scm_StringBuilder = (function() {
  $c_scm_AbstractSeq.call(this);
  this.underlying$5 = null
});
$c_scm_StringBuilder.prototype = new $h_scm_AbstractSeq();
$c_scm_StringBuilder.prototype.constructor = $c_scm_StringBuilder;
/** @constructor */
var $h_scm_StringBuilder = (function() {
  /*<skip>*/
});
$h_scm_StringBuilder.prototype = $c_scm_StringBuilder.prototype;
$c_scm_StringBuilder.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___ = (function() {
  $c_scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & $uI(thiz["charCodeAt"](idx)));
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
$c_scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & $uI(thiz["charCodeAt"](index)));
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $as_T(thiz["substring"](start, end))
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_StringBuilder.prototype.toString__T = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
$c_scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  $s_sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
$c_scm_StringBuilder.prototype.reverse__O = (function() {
  return this.reverse__scm_StringBuilder()
});
$c_scm_StringBuilder.prototype.result__O = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
$c_scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  this.underlying$5.append__T__jl_StringBuilder(s);
  return this
});
$c_scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(thiz["length"]))
});
$c_scm_StringBuilder.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  $c_scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, new $c_jl_StringBuilder().init___I((($uI(initValue["length"]) + initCapacity) | 0)).append__T__jl_StringBuilder(initValue));
  return this
});
$c_scm_StringBuilder.prototype.length__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $uI(thiz["length"])
});
$c_scm_StringBuilder.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
$c_scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  this.underlying$5.append__T__jl_StringBuilder($m_sjsr_RuntimeString$().valueOf__O__T(x));
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
$c_scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_StringBuilder.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_StringBuilder.prototype.reverse__scm_StringBuilder = (function() {
  return new $c_scm_StringBuilder().init___jl_StringBuilder(new $c_jl_StringBuilder().init___jl_CharSequence(this.underlying$5).reverse__jl_StringBuilder())
});
$c_scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.toCollection__O__sc_Seq = (function(repr) {
  var repr$1 = $as_scm_StringBuilder(repr);
  return repr$1
});
$c_scm_StringBuilder.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_StringBuilder().init___())
});
$c_scm_StringBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $is_scm_StringBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_StringBuilder)))
});
var $as_scm_StringBuilder = (function(obj) {
  return (($is_scm_StringBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.StringBuilder"))
});
var $isArrayOf_scm_StringBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_StringBuilder)))
});
var $asArrayOf_scm_StringBuilder = (function(obj, depth) {
  return (($isArrayOf_scm_StringBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.StringBuilder;", depth))
});
var $d_scm_StringBuilder = new $TypeData().initClass({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder.prototype.$classData = $d_scm_StringBuilder;
/** @constructor */
var $c_sjs_js_WrappedArray = (function() {
  $c_scm_AbstractBuffer.call(this);
  this.array$6 = null
});
$c_sjs_js_WrappedArray.prototype = new $h_scm_AbstractBuffer();
$c_sjs_js_WrappedArray.prototype.constructor = $c_sjs_js_WrappedArray;
/** @constructor */
var $h_sjs_js_WrappedArray = (function() {
  /*<skip>*/
});
$h_sjs_js_WrappedArray.prototype = $c_sjs_js_WrappedArray.prototype;
$c_sjs_js_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.init___ = (function() {
  $c_sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
$c_sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
$c_sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6["push"](elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sjs_js_WrappedArray$()
});
$c_sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  $s_sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
$c_sjs_js_WrappedArray.prototype.reverse__O = (function() {
  return $s_sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
$c_sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(this.array$6["length"]))
});
$c_sjs_js_WrappedArray.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sjs_js_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.length__I = (function() {
  return $uI(this.array$6["length"])
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.array$6["push"](elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
$c_sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
$c_sjs_js_WrappedArray.prototype.toCollection__O__sc_Seq = (function(repr) {
  return $as_scm_IndexedSeq(repr)
});
$c_sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
var $is_sjs_js_WrappedArray = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedArray)))
});
var $as_sjs_js_WrappedArray = (function(obj) {
  return (($is_sjs_js_WrappedArray(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.WrappedArray"))
});
var $isArrayOf_sjs_js_WrappedArray = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedArray)))
});
var $asArrayOf_sjs_js_WrappedArray = (function(obj, depth) {
  return (($isArrayOf_sjs_js_WrappedArray(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.WrappedArray;", depth))
});
var $d_sjs_js_WrappedArray = new $TypeData().initClass({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
$c_sjs_js_WrappedArray.prototype.$classData = $d_sjs_js_WrappedArray;
/** @constructor */
var $c_scm_ArrayBuffer = (function() {
  $c_scm_AbstractBuffer.call(this);
  this.initialSize$6 = 0;
  this.array$6 = null;
  this.size0$6 = 0
});
$c_scm_ArrayBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ArrayBuffer.prototype.constructor = $c_scm_ArrayBuffer;
/** @constructor */
var $h_scm_ArrayBuffer = (function() {
  /*<skip>*/
});
$h_scm_ArrayBuffer.prototype = $c_scm_ArrayBuffer.prototype;
$c_scm_ArrayBuffer.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.init___ = (function() {
  $c_scm_ArrayBuffer.prototype.init___I.call(this, 16);
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_ArrayBuffer = (function(elem) {
  var n = ((1 + this.size0$6) | 0);
  $s_scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V(this, n);
  this.array$6.u[this.size0$6] = elem;
  this.size0$6 = ((1 + this.size0$6) | 0);
  return this
});
$c_scm_ArrayBuffer.prototype.apply__I__O = (function(idx) {
  return $s_scm_ResizableArray$class__apply__scm_ResizableArray__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
$c_scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  var idx = $uI(v1);
  return $s_scm_ResizableArray$class__apply__scm_ResizableArray__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayBuffer.prototype.isEmpty__Z = (function() {
  return $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ArrayBuffer$()
});
$c_scm_ArrayBuffer.prototype.foreach__F1__V = (function(f) {
  $s_scm_ResizableArray$class__foreach__scm_ResizableArray__F1__V(this, f)
});
$c_scm_ArrayBuffer.prototype.reverse__O = (function() {
  return $s_sc_IndexedSeqOptimized$class__reverse__sc_IndexedSeqOptimized__O(this)
});
$c_scm_ArrayBuffer.prototype.result__O = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
});
$c_scm_ArrayBuffer.prototype.init___I = (function(initialSize) {
  this.initialSize$6 = initialSize;
  $s_scm_ResizableArray$class__$$init$__scm_ResizableArray__V(this);
  return this
});
$c_scm_ArrayBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ArrayBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer = (function(xs) {
  if ($is_sc_IndexedSeqLike(xs)) {
    var x2 = $as_sc_IndexedSeqLike(xs);
    var n = x2.length__I();
    var n$1 = ((this.size0$6 + n) | 0);
    $s_scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V(this, n$1);
    x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
    this.size0$6 = ((this.size0$6 + n) | 0);
    return this
  } else {
    return $as_scm_ArrayBuffer($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.sizeHint__I__V = (function(len) {
  if (((len > this.size0$6) && (len >= 1))) {
    var newarray = $newArrayObject($d_O.getArrayOf(), [len]);
    var src = this.array$6;
    var length = this.size0$6;
    $systemArraycopy(src, 0, newarray, 0, length);
    this.array$6 = newarray
  }
});
$c_scm_ArrayBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_scm_ResizableArray$class__copyToArray__scm_ResizableArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayBuffer.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_ArrayBuffer.prototype.toCollection__O__sc_Seq = (function(repr) {
  return $as_scm_IndexedSeq(repr)
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
});
$c_scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
var $is_scm_ArrayBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
});
var $as_scm_ArrayBuffer = (function(obj) {
  return (($is_scm_ArrayBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
});
var $isArrayOf_scm_ArrayBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
});
var $asArrayOf_scm_ArrayBuffer = (function(obj, depth) {
  return (($isArrayOf_scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
});
var $d_scm_ArrayBuffer = new $TypeData().initClass({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer.prototype.$classData = $d_scm_ArrayBuffer;
}).call(this);
//# sourceMappingURL=starter-fastopt.js.map
