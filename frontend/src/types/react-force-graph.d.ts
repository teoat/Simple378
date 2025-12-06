declare module 'react-force-graph-2d' {
  import { Component } from 'react';
  
  export interface GraphData {
    nodes: any[];
    links: any[];
  }

  export interface ForceGraphProps {
    graphData?: GraphData;
    width?: number;
    height?: number;
    nodeLabel?: string | ((node: any) => string);
    nodeColor?: string | ((node: any) => string);
    nodeRelSize?: number;
    linkColor?: string | ((link: any) => string);
    [key: string]: any;
  }

  export default class ForceGraph2D extends Component<ForceGraphProps> {}
}
