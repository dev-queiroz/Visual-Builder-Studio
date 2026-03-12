import { Project, LogicBlock, Variable, UIComponent } from '@/types';
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
        const blockId = component.events?.[eventName];
        if (!blockId) return;

        const startBlock = this.project.logicBlocks?.find(b => b.id === blockId);
        if (!startBlock) {
            console.warn(`[LogicEngine] Block ${blockId} not found for event ${eventName}`);
            return;
        }

        this.executeFlow(startBlock);
    }

    /**
     * Executes a logic flow starting from a specific block.
     * If the block is an EVENT, it skips to the next block.
     */
    async executeFlow(startBlock: LogicBlock) {
        if (!this.validateBlock(startBlock)) return;

        let currentBlock: LogicBlock | undefined = startBlock;

        // If it's an event block, we don't "execute" it, we just start from the next one
        if (currentBlock.type === 'event') {
            if (currentBlock.nextBlockId) {
                currentBlock = this.project.logicBlocks?.find(b => b.id === currentBlock?.nextBlockId);
            } else {
                return; // Event with no actions attached
            }
        }

        while (currentBlock) {
            if (!this.validateBlock(currentBlock)) break;

            // Execute the block and get the potential next block ID (for branching like IF)
            const nextOverride = await this.runBlock(currentBlock);

            const nextId = nextOverride || currentBlock.nextBlockId;
            if (!nextId) break;

            currentBlock = this.project.logicBlocks?.find(b => b.id === nextId);
        }
    }

    private validateBlock(block: LogicBlock): boolean {
        if (!block.opcode) {
            console.error('[LogicEngine] Block missing opcode:', block.id);
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
    private async runBlock(block: LogicBlock): Promise<string | undefined> {
        // Skip events if they ever end up here
        if (block.type === 'event') return undefined;

        console.log(`[LogicEngine] Running ${block.opcode}`, block.inputs);

        switch (block.opcode) {
            case 'SHOW_ALERT': {
                const title = this.resolveValue(block.inputs.title) || 'Alert';
                const message = this.resolveValue(block.inputs.message) || '';
                Alert.alert(title, message);
                break;
            }

            case 'NAVIGATE': {
                const screenId = block.inputs.screenId;
                if (screenId && this.navigateTo) {
                    this.navigateTo(screenId);
                }
                break;
            }

            case 'SET_VARIABLE': {
                const varName = block.inputs.variableName;
                const value = this.resolveValue(block.inputs.value);
                if (varName) {
                    this.setRuntimeVariable(varName, value);
                }
                break;
            }

            case 'CONSOLE_LOG':
            case 'LOG': {
                const msg = this.resolveValue(block.inputs.message);
                console.log('[AppZap Log]:', msg);
                break;
            }

            case 'IF':
            case 'IF_ELSE': {
                const condition = this.resolveValue(block.inputs.condition);
                // Basic truthy check, can be expanded to real comparisons later
                const isTrue = !!condition && condition !== 'false' && condition !== '0';

                return isTrue
                    ? block.inputs.trueBlockId
                    : block.inputs.falseBlockId;
            }

            case 'DELAY': {
                const ms = parseInt(this.resolveValue(block.inputs.duration)) || 1000;
                await new Promise(resolve => setTimeout(resolve, ms));
                break;
            }

            default:
                console.warn(`[LogicEngine] Unsupported opcode: ${block.opcode}`);
        }

        return undefined;
    }
}
