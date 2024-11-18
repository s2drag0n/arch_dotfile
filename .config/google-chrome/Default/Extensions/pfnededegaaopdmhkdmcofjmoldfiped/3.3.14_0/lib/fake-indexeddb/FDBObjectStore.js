import FDBCursor from"./FDBCursor.js";import FDBCursorWithValue from"./FDBCursorWithValue.js";import FDBIndex from"./FDBIndex.js";import FDBKeyRange from"./FDBKeyRange.js";import FDBRequest from"./FDBRequest.js";import canInjectKey from"./lib/canInjectKey.js";import enforceRange from"./lib/enforceRange.js";import{ConstraintError,DataError,InvalidAccessError,InvalidStateError,NotFoundError,ReadOnlyError,TransactionInactiveError}from"./lib/errors.js";import extractKey from"./lib/extractKey.js";import FakeDOMStringList from"./lib/FakeDOMStringList.js";import Index from"./lib/Index.js";import validateKeyPath from"./lib/validateKeyPath.js";import valueToKey from"./lib/valueToKey.js";import valueToKeyRange from"./lib/valueToKeyRange.js";const confirmActiveTransaction=objectStore=>{if(objectStore._rawObjectStore.deleted)throw new InvalidStateError;if("active"!==objectStore.transaction._state)throw new TransactionInactiveError},buildRecordAddPut=(objectStore,value,key)=>{if(confirmActiveTransaction(objectStore),"readonly"===objectStore.transaction.mode)throw new ReadOnlyError;if(null!==objectStore.keyPath&&void 0!==key)throw new DataError;const clone=structuredClone(value);if(null!==objectStore.keyPath){const tempKey=extractKey(objectStore.keyPath,clone);if(void 0!==tempKey)valueToKey(tempKey);else{if(!objectStore._rawObjectStore.keyGenerator)throw new DataError;if(!canInjectKey(objectStore.keyPath,clone))throw new DataError}}if(null===objectStore.keyPath&&null===objectStore._rawObjectStore.keyGenerator&&void 0===key)throw new DataError;return void 0!==key&&(key=valueToKey(key)),{key:key,value:clone}};class FDBObjectStore{_indexesCache=new Map;constructor(transaction,rawObjectStore){this._rawObjectStore=rawObjectStore,this._name=rawObjectStore.name,this.keyPath=rawObjectStore.keyPath,this.autoIncrement=rawObjectStore.autoIncrement,this.transaction=transaction,this.indexNames=new FakeDOMStringList(...Array.from(rawObjectStore.rawIndexes.keys()).sort())}get name(){return this._name}set name(name){const transaction=this.transaction;if(!transaction.db._runningVersionchangeTransaction)throw new InvalidStateError;if(confirmActiveTransaction(this),(name=String(name))===this._name)return;if(this._rawObjectStore.rawDatabase.rawObjectStores.has(name))throw new ConstraintError;const oldName=this._name,oldObjectStoreNames=[...transaction.db.objectStoreNames];this._name=name,this._rawObjectStore.name=name,this.transaction._objectStoresCache.delete(oldName),this.transaction._objectStoresCache.set(name,this),this._rawObjectStore.rawDatabase.rawObjectStores.delete(oldName),this._rawObjectStore.rawDatabase.rawObjectStores.set(name,this._rawObjectStore),transaction.db.objectStoreNames=new FakeDOMStringList(...Array.from(this._rawObjectStore.rawDatabase.rawObjectStores.keys()).filter((objectStoreName=>{const objectStore=this._rawObjectStore.rawDatabase.rawObjectStores.get(objectStoreName);return objectStore&&!objectStore.deleted})).sort());const oldScope=new Set(transaction._scope),oldTransactionObjectStoreNames=[...transaction.objectStoreNames];this.transaction._scope.delete(oldName),transaction._scope.add(name),transaction.objectStoreNames=new FakeDOMStringList(...Array.from(transaction._scope).sort()),transaction._rollbackLog.push((()=>{this._name=oldName,this._rawObjectStore.name=oldName,this.transaction._objectStoresCache.delete(name),this.transaction._objectStoresCache.set(oldName,this),this._rawObjectStore.rawDatabase.rawObjectStores.delete(name),this._rawObjectStore.rawDatabase.rawObjectStores.set(oldName,this._rawObjectStore),transaction.db.objectStoreNames=new FakeDOMStringList(...oldObjectStoreNames),transaction._scope=oldScope,transaction.objectStoreNames=new FakeDOMStringList(...oldTransactionObjectStoreNames)}))}put(value,key){if(0===arguments.length)throw new TypeError;const record=buildRecordAddPut(this,value,key);return this.transaction._execRequestAsync({operation:this._rawObjectStore.storeRecord.bind(this._rawObjectStore,record,!1,this.transaction._rollbackLog),source:this})}add(value,key){if(0===arguments.length)throw new TypeError;const record=buildRecordAddPut(this,value,key);return this.transaction._execRequestAsync({operation:this._rawObjectStore.storeRecord.bind(this._rawObjectStore,record,!0,this.transaction._rollbackLog),source:this})}delete(key){if(0===arguments.length)throw new TypeError;if(confirmActiveTransaction(this),"readonly"===this.transaction.mode)throw new ReadOnlyError;return key instanceof FDBKeyRange||(key=valueToKey(key)),this.transaction._execRequestAsync({operation:this._rawObjectStore.deleteRecord.bind(this._rawObjectStore,key,this.transaction._rollbackLog),source:this})}get(key){if(0===arguments.length)throw new TypeError;return confirmActiveTransaction(this),key instanceof FDBKeyRange||(key=valueToKey(key)),this.transaction._execRequestAsync({operation:this._rawObjectStore.getValue.bind(this._rawObjectStore,key),source:this})}getAll(query,count){arguments.length>1&&void 0!==count&&(count=enforceRange(count,"unsigned long")),confirmActiveTransaction(this);const range=valueToKeyRange(query);return this.transaction._execRequestAsync({operation:this._rawObjectStore.getAllValues.bind(this._rawObjectStore,range,count),source:this})}getKey(key){if(0===arguments.length)throw new TypeError;return confirmActiveTransaction(this),key instanceof FDBKeyRange||(key=valueToKey(key)),this.transaction._execRequestAsync({operation:this._rawObjectStore.getKey.bind(this._rawObjectStore,key),source:this})}getAllKeys(query,count){arguments.length>1&&void 0!==count&&(count=enforceRange(count,"unsigned long")),confirmActiveTransaction(this);const range=valueToKeyRange(query);return this.transaction._execRequestAsync({operation:this._rawObjectStore.getAllKeys.bind(this._rawObjectStore,range,count),source:this})}clear(){if(confirmActiveTransaction(this),"readonly"===this.transaction.mode)throw new ReadOnlyError;return this.transaction._execRequestAsync({operation:this._rawObjectStore.clear.bind(this._rawObjectStore,this.transaction._rollbackLog),source:this})}openCursor(range,direction){confirmActiveTransaction(this),null===range&&(range=void 0),void 0===range||range instanceof FDBKeyRange||(range=FDBKeyRange.only(valueToKey(range)));const request=new FDBRequest;request.source=this,request.transaction=this.transaction;const cursor=new FDBCursorWithValue(this,range,direction,request);return this.transaction._execRequestAsync({operation:cursor._iterate.bind(cursor),request:request,source:this})}openKeyCursor(range,direction){confirmActiveTransaction(this),null===range&&(range=void 0),void 0===range||range instanceof FDBKeyRange||(range=FDBKeyRange.only(valueToKey(range)));const request=new FDBRequest;request.source=this,request.transaction=this.transaction;const cursor=new FDBCursor(this,range,direction,request,!0);return this.transaction._execRequestAsync({operation:cursor._iterate.bind(cursor),request:request,source:this})}createIndex(name,keyPath,optionalParameters={}){if(arguments.length<2)throw new TypeError;const multiEntry=void 0!==optionalParameters.multiEntry&&optionalParameters.multiEntry,unique=void 0!==optionalParameters.unique&&optionalParameters.unique;if("versionchange"!==this.transaction.mode)throw new InvalidStateError;if(confirmActiveTransaction(this),this.indexNames.contains(name))throw new ConstraintError;if(validateKeyPath(keyPath),Array.isArray(keyPath)&&multiEntry)throw new InvalidAccessError;const indexNames=[...this.indexNames];this.transaction._rollbackLog.push((()=>{const index2=this._rawObjectStore.rawIndexes.get(name);index2&&(index2.deleted=!0),this.indexNames=new FakeDOMStringList(...indexNames),this._rawObjectStore.rawIndexes.delete(name)}));const index=new Index(this._rawObjectStore,name,keyPath,multiEntry,unique);return this.indexNames._push(name),this.indexNames._sort(),this._rawObjectStore.rawIndexes.set(name,index),index.initialize(this.transaction),new FDBIndex(this,index)}index(name){if(0===arguments.length)throw new TypeError;if(this._rawObjectStore.deleted||"finished"===this.transaction._state)throw new InvalidStateError;const index=this._indexesCache.get(name);if(void 0!==index)return index;const rawIndex=this._rawObjectStore.rawIndexes.get(name);if(!this.indexNames.contains(name)||void 0===rawIndex)throw new NotFoundError;const index2=new FDBIndex(this,rawIndex);return this._indexesCache.set(name,index2),index2}deleteIndex(name){if(0===arguments.length)throw new TypeError;if("versionchange"!==this.transaction.mode)throw new InvalidStateError;confirmActiveTransaction(this);const rawIndex=this._rawObjectStore.rawIndexes.get(name);if(void 0===rawIndex)throw new NotFoundError;this.transaction._rollbackLog.push((()=>{rawIndex.deleted=!1,this._rawObjectStore.rawIndexes.set(name,rawIndex),this.indexNames._push(name),this.indexNames._sort()})),this.indexNames=new FakeDOMStringList(...Array.from(this.indexNames).filter((indexName=>indexName!==name))),rawIndex.deleted=!0,this.transaction._execRequestAsync({operation:()=>{const rawIndex2=this._rawObjectStore.rawIndexes.get(name);rawIndex===rawIndex2&&this._rawObjectStore.rawIndexes.delete(name)},source:this})}count(key){return confirmActiveTransaction(this),null===key&&(key=void 0),void 0===key||key instanceof FDBKeyRange||(key=FDBKeyRange.only(valueToKey(key))),this.transaction._execRequestAsync({operation:()=>this._rawObjectStore.count(key),source:this})}toString(){return"[object IDBObjectStore]"}}export default FDBObjectStore;