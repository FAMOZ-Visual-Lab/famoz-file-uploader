function limit_queue(MAX) {
  // #1. 최대 n개를 동시에 처리한다는 의미
  this.MAX_COUNT = MAX;

  // #2. 현재 처리되고 있는 stream 수. 이 수는 위의 MAX_COUNt를 넘을 수 없다.
  this.count = 0;

  // #3. 데이터들이 일어남.
  this.dataStore = [];

  // #4. function을 받는다.
  this.enqueue = element => {
    this.dataStore.push(element);
  };

  // #5. 해당 카운트가 MAX_COUNT 이하인 경우만 shift 실행.
  this.dequeue = () => {
    if (this.count < this.MAX_COUNT) {
      this.count++;
      return this.dataStore.shift();
    }
    return undefined;
  };

  // #6. 최대 카운트 해제
  this.release = () => {
    this.count = -1;
  };
}

module.exports = limit_queue;
