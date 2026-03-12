import { Project, WorkflowNode, DataVariable, UIComponent } from '@/types';
import { Alert } from 'react-native';

export class LogicEngine {
    private project: Project;
    private runtimeVariables: Record<string, any>;
    private setRuntimeVariable: (name: string, value: any) => void;
    private navigateTo?: (screenId: string) => void;

    constructor(
        project: Project,
        runtimeVariables: Record<string, any>,
        setRuntimeVariable: (name: string, value: any) => void,
        navigateTo?: (screenId: string) => void
    ) {
        this.project = project;
        this.runtimeVariables = runtimeVariables;
        this.setRuntimeVariable = setRuntimeVariable;
        this.navigateTo = navigateTo;
    }

    /**
     * Entry point for component events.
     * Finds the bound logic flow and executes its actions.
     */
    dispatchComponentEvent(component: UIComponent, eventName: string) {
        const nodeId = component.events?.[eventName];
        if (!nodeId) return;

        const startNode = this.project.workflowNodes?.find(b => b.id === nodeId);
        if (!startNode) {
            console.warn(`[LogicEngine] Node ${nodeId} not found for event ${eventName}`);
            return;
        }

        this.executeFlow(startNode);
    }

    /**
     * Executes a logic flow starting from a specific block.
     * If the block is an EVENT, it skips to the next block.
     */
    async executeFlow(startNode: WorkflowNode) {
        if (!this.validateNode(startNode)) return;

        let currentNode: WorkflowNode | undefined = startNode;

        // If it's a trigger node, we don't "execute" it, we just start from the next one
        if (currentNode.type === 'trigger') {
            if (currentNode.nextBlockId) {
                currentNode = this.project.workflowNodes?.find(b => b.id === currentNode?.nextBlockId);
            } else {
                return; // Trigger with no actions attached
            }
        }

        while (currentNode) {
            if (!this.validateNode(currentNode)) break;

            // Execute the node and get the potential next node ID (for branching like IF)
            const nextOverride = await this.runNode(currentNode);

            const nextId = nextOverride || currentNode.nextBlockId;
            if (!nextId) break;

            currentNode = this.project.workflowNodes?.find(b => b.id === nextId);
        }
    }

    private validateNode(node: WorkflowNode): boolean {
        if (!node.opcode) {
            console.error('[LogicEngine] Node missing opcode:', node.id);
            return false;
        }
        return true;
    }

    private resolveValue(val: any): any {
        if (typeof val !== 'string') return val;

        // Simple regex to find all {{var}} occurrences
        return val.replace(/\{\{(.*?)\}\}/g, (match, varName) => {
            const trimmed = varName.trim();
            return this.runtimeVariables[trimmed] !== undefined
                ? String(this.runtimeVariables[trimmed])
                : ''; // Fallback to empty string instead of original tag
        });
    }

    /**
     * Runs a single block. 
     * Returns a string ID if the flow should jump to a specific block (e.g. IF branch), 
     * otherwise returns undefined to continue normal chain.
     */
    private async runNode(node: WorkflowNode): Promise<string | undefined> {
        // Skip triggers if they ever end up here
        if (node.type === 'trigger') return undefined;

        console.log(`[LogicEngine] Running ${node.opcode}`, node.inputs);

        switch (node.opcode) {
            case 'SHOW_ALERT': {
                const title = this.resolveValue(node.inputs.title) || 'Alert';
                const message = this.resolveValue(node.inputs.message) || '';
                Alert.alert(title, message);
                break;
            }

            case 'NAVIGATE': {
                const screenId = node.inputs.screenId;
                if (screenId && this.navigateTo) {
                    this.navigateTo(screenId);
                }
                break;
            }

            case 'SET_VARIABLE': {
                const varName = node.inputs.variableName;
                const value = this.resolveValue(node.inputs.value);
                if (varName) {
                    this.setRuntimeVariable(varName, value);
                }
                break;
            }

            case 'GET_API': {
                const url = this.resolveValue(node.inputs.url);
                const method = node.inputs.method || 'GET';
                const variableName = node.inputs.variableName;

                if (url) {
                    try {
                        const res = await fetch(url, { method });
                        const data = await res.json();
                        if (variableName) {
                            this.setRuntimeVariable(variableName, data);
                        }
                    } catch (e) {
                        console.error('[LogicEngine] API Error:', e);
                    }
                }
                break;
            }

            case 'CONSOLE_LOG':
            case 'LOG': {
                const msg = this.resolveValue(node.inputs.message);
                console.log('[AppZap Log]:', msg);
                break;
            }

            case 'IF':
            case 'IF_ELSE': {
                const condition = this.resolveValue(node.inputs.condition);
                // Basic truthy check, can be expanded to real comparisons later
                const isTrue = !!condition && condition !== 'false' && condition !== '0';

                return isTrue
                    ? node.inputs.trueBlockId
                    : node.inputs.falseBlockId;
            }

            case 'DELAY': {
                const ms = parseInt(this.resolveValue(node.inputs.duration)) || 1000;
                await new Promise(resolve => setTimeout(resolve, ms));
                break;
            }

            default:
                console.warn(`[LogicEngine] Unsupported opcode: ${node.opcode}`);
        }

        return undefined;
    }
}
