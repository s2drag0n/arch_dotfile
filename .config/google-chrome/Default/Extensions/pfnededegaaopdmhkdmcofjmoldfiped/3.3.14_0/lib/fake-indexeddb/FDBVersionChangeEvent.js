import FakeEvent from"./lib/FakeEvent.js";class FDBVersionChangeEvent extends FakeEvent{constructor(type,parameters={}){super(type),this.newVersion=void 0!==parameters.newVersion?parameters.newVersion:null,this.oldVersion=void 0!==parameters.oldVersion?parameters.oldVersion:0}toString(){return"[object IDBVersionChangeEvent]"}}export default FDBVersionChangeEvent;