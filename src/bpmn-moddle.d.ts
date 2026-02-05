declare module 'bpmn-moddle' {
    export class BpmnModdle {
        constructor(packages?: any, options?: any);
        fromXML(xmlStr: string, typeName?: string | any, options?: any): Promise<{
            rootElement: any;
            references: any[];
            warnings: any[];
            elementsById: any;
        }>;
        toXML(element: any, options?: any): Promise<{
            xml: string;
        }>;
    }
}
