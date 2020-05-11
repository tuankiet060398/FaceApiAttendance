/* SystemJS module definition */
declare var module: NodeModule;
declare module "*.json";
declare module 'file-saver';
interface NodeModule {
  id: string;
}