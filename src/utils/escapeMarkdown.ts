export default (input: string): string => input.replace(/([\\`*{}[\]()#+\-.!_|])/g, '\\$1');
