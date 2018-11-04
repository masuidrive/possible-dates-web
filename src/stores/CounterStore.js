import { observable, action, computed } from 'mobx'

class Test1 {
  @observable msg = undefined

  @action
  setMessage() {
    this.msg = "Done";
  }
}

export default class CounterStore {
  @observable counter = 0;
  //@observable test1;

  constructor() {
    this.test1 = [new Test1()];
    this.test2 = this.test1[0];
  }

  @action
  increment() {
    this.counter++;
  }

  @action
  decrement() {
    this.counter--;
  }

  //@action
  doTest1() {
    this.test2.setMessage();
    //this.test1 = this.test1;
  }
}