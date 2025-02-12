// @flow
import React from 'react';
import { uniq, isEqual } from 'lodash';
import NodeBase from 'models/NodeBase';
import Edge from 'models/Edge';

const Types = window.Types;

export class EqualsNode extends NodeBase<{}, { numbers: any[] }, { result: boolean }> {
  static +displayName = 'Equals';
  static +registryName = 'EqualsNode';
  static description = <span>Strict equals operator</span>;
  static schema = {
    input: { input: Types.any.desc('Any set of members to perform strict equals over') },
    output: { result: Types.number.desc('Logical equals over inputs') },
    state: {},
  };
  _map: { [string]: any } = {};

  process = () => ({ result: uniq(this.inputs.map(e => this._map[e.id])).length === 1 });

  onInputChange = (edge: Edge, change: Object) => {
    this._map[edge.id] = edge.inDataFor(change);
    return this.outKeys();
  };
}

export class AndNode extends NodeBase<{}, { numbers: any[] }, { result: boolean }> {
  static +displayName = 'AND';
  static +registryName = 'AndNode';
  static description = <span>Logical AND over inputs</span>;
  static schema = {
    input: { input: Types.any.desc('Any set of members to logical `AND` over') },
    output: { result: Types.number.desc('Logical and of inputs') },
    state: {},
  };
  _map: { [string]: any } = {};

  process = () => ({ result: this.inputs.reduce((memo, e) => memo && this._map[e.id], true) });

  onInputChange = (edge: Edge, change: Object) => {
    this._map[edge.id] = edge.inDataFor(change);
    return this.outKeys();
  };
}

export class OrNode extends NodeBase<{}, { numbers: any[] }, { result: boolean }> {
  static +displayName = 'OR';
  static +registryName = 'OrNode';
  static description = <span>Logical OR over inputs</span>;
  static schema = {
    input: { input: Types.any.desc('Any set of members to logical `OR` over') },
    output: { result: Types.number.desc('Logical OR of inputs') },
    state: {},
  };
  _map: { [string]: any } = {};

  process = () => ({ result: this.inputs.reduce((memo, e) => memo || this._map[e.id], false) });

  onInputChange = (edge: Edge, change: Object) => {
    this._map[edge.id] = edge.inDataFor(change);
    return this.outKeys();
  };
}

export class NotNode extends NodeBase<{}, { in: any }, { result: boolean }> {
  static +displayName = 'Not';
  static +registryName = 'NotNode';
  static description = <span>logical not</span>;
  static schema = {
    input: { in: Types.any.desc('anything. negation follows regular js semantics') },
    output: { result: Types.boolean },
    state: {},
  };

  process = () => ({ result: !this.props.in });
  onInputChange = (edge: Edge, change: Object) => this.outKeys();
}

export class SwitchNode extends NodeBase<{}, { value: any, not: any, else: any }, { result: any }> {
  static +displayName = 'Switch';
  static +registryName = 'SwitchNode';
  static description = <span>An If-Else switch on value equality</span>;
  static schema = {
    input: {
      value: Types.any.desc('Any value, as input to the switch'),
      not: Types.any.desc('Any value to use to compare the input to'),
      else: Types.any.desc('Any value to return if not logically equal'),
    },
    output: { result: Types.any.desc('Result of the switch') },
    state: {},
  };

  requireForOutput = () => {
    return typeof this.props.value !== 'undefined' && typeof this.props.not !== 'undefined';
  };

  process = () => ({
    result: isEqual(this.props.value, this.props.not) ? this.props.else : this.props.value,
  });

  onInputChange = () => this.outKeys();
}
