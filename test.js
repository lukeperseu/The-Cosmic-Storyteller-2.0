const obj = {};
obj.self = obj;
try {
  JSON.stringify(obj);
} catch (e) {
  console.log(e.message);
}
