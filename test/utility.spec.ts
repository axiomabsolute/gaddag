import {
  cloneDict,
  Dictionary,
  flatten,
  makeIdGenerator,
  permute,
  reverse,
  values,
} from '../src/gaddag';
import { expect } from 'chai';

describe('permute', () => {
  it('should return empty array for empty input', () => {
    let perms = permute([]);
    expect(perms.length).to.be.equal(1);
    expect(perms[0]).to.be.empty;
  });

  it('should return permutations', () => {
    let perms = permute([1,2,3]);
    expect(perms.length).to.be.equal(6);
    expect(perms).to.deep.include([1,2,3]);
    expect(perms).to.deep.include([1,3,2]);
    expect(perms).to.deep.include([2,1,3]);
    expect(perms).to.deep.include([2,3,1]);
    expect(perms).to.deep.include([3,1,2]);
    expect(perms).to.deep.include([3,2,1]);
  })
});

describe('flatten', () => {
  it('returns empty list given empty list', () => {
    expect(flatten([])).to.be.empty;
  });

  it('flattens one level', () => {
    let start = [
      [1,2,3],
      [4,5,6]
    ];
    let result = flatten(start);
    expect(result).to.deep.equal([1,2,3,4,5,6]);
  });

  it('does not flatten deeper', () => {
    let start = [
      [
        [1, 2, 3],
      ],
      [
        [4, 5, 6]
      ]
    ];
    let result = flatten(start);
    expect(result).to.deep.equal([[1,2,3], [4,5,6]]);
  });
});

describe('makeIdGenerator', () => {
  let idGenerator: () => number;
  beforeEach(() => {
    idGenerator = makeIdGenerator();
  });

  it('monotonically increases', () => {
    expect(idGenerator()).to.be.equal(0);
    expect(idGenerator()).to.be.equal(1);
    expect(idGenerator()).to.be.equal(2);
  });

  it('creates isolated instances', () => {
    expect(idGenerator()).to.be.equal(0);
    expect(idGenerator()).to.be.equal(1);
    let idGenerator2 = makeIdGenerator();
    expect(idGenerator2()).to.be.equal(0);
  });
});

describe('cloneDict', () => {
  it('creates a shallow clone', () => {
    let source = new Dictionary<number>();
    source['one'] = 1;
    source['two'] = 2;
    source['three'] = 3;
    let clone = cloneDict(source);
    expect(clone).to.deep.equal(source);
  });
});

describe('reverse', () => {
  it('reverses a word', () => {
    expect(reverse('thing')).to.be.equal('gniht');
  });
});

describe('values', () => {
  it('returns the values of a dictionary', () => {
    let source = new Dictionary<number>();
    source['one'] = 1;
    source['two'] = 2;
    let result = values(source);
    expect(result).to.be.deep.equal([1,2])
  });
});