import { GaddagNode } from '../src/gaddag';
import { expect } from 'chai';

describe('GaddagNode', () => {
  let node: GaddagNode;
  beforeEach(() => {
    node = null;
  });
  it('should create', () => {
    expect(node).to.be.equal(null);
    node = new GaddagNode(1, 'test', {}, false);
    expect(node.id).to.be.equal(1);
  });

  describe('.count', () => {
    beforeEach(() => {
      node = new GaddagNode(1, 'test', {}, false);
      node.meta['test'] = 'testing';
    });

    it('should return 1 when not yet counted', () => {
      let flag = new Date();
      expect(node.count(flag)).to.be.equal(1);
    });

    it('should return 0 when already counted', () => {
      let flag = new Date();
      node.count(flag);
      expect(node.count(flag)).to.be.equal(0);
    });
  });

  describe('.include', () => {
    beforeEach(() => {
      node = new GaddagNode(1, 'test', {}, false);
      node.meta['test'] = 'testing';
    });

    it('should return true when not yet included', () => {
      let flag = new Date();
      expect(node.include(flag)).to.be.true;
    });

    it('should return false when already included', () => {
      let flag = new Date();
      node.include(flag);
      expect(node.include(flag)).to.be.false;
    });
  });

  describe('.clearMeta', () => {
    beforeEach(() => {
      node = new GaddagNode(1, 'test', {}, false);
      node.meta['test'] = 'testing';
    });
    
    it('should clear meta information', () => {
      expect(node.meta['test']).to.be.equal('testing');
      node.clearMeta();
      expect(node.meta['test']).to.be.equal(undefined);
    });
  });
});