import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    useColorScheme,
    Platform,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogicBlock } from '@/types';
import { AppColors } from '@/constants/colors';
import LogicBlockView from './LogicBlockView';

interface Props {
    visible: boolean;
    onClose: () => void;
    blocks: LogicBlock[];
    onAddBlock: (block: Omit<LogicBlock, 'id'>) => void;
    onUpdateBlock: (id: string, block: Partial<LogicBlock>) => void;
    onRemoveBlock: (id: string) => void;
}

export default function LogicEditor({
    visible,
    onClose,
    blocks,
    onAddBlock,
    onUpdateBlock,
    onRemoveBlock
}: Props) {
    const isDark = useColorScheme() === 'dark';
    const theme = isDark ? AppColors.dark : AppColors.light;
    const insets = useSafeAreaInsets();
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedScale = useSharedValue(1);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const handleAddDefaultEvent = () => {
        onAddBlock({
            type: 'event',
            opcode: 'ON_START',
            inputs: {},
            position: { x: 100, y: 100 },
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Top Header */}
                <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Visual Logic</Text>
                    <TouchableOpacity onPress={handleAddDefaultEvent} style={[styles.addBtn, { backgroundColor: AppColors.primary }]}>
                        <MaterialIcons name="add" size={20} color="#FFF" />
                        <Text style={styles.addBtnText}>Block</Text>
                    </TouchableOpacity>
                </View>

                {/* Blocks Canvas */}
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <GestureDetector gesture={composedGesture}>
                        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                            <View style={styles.gridBg} />
                            {blocks.map((block) => (
                                <LogicBlockView
                                    key={block.id}
                                    block={block}
                                    isSelected={block.id === selectedBlockId}
                                    onSelect={setSelectedBlockId}
                                    onUpdateInput={(id, key, val) => onUpdateBlock(id, { inputs: { ...block.inputs, [key]: val } })}
                                    onDrag={(id, x, y) => onUpdateBlock(id, { position: { x, y } })}
                                />
                            ))}
                        </Animated.View>
                    </GestureDetector>
                </GestureHandlerRootView>

                {/* Bottom Toolbar */}
                <View style={[styles.toolbar, { paddingBottom: insets.bottom + 8, backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
                        <Category label="Events">
                            <BlockBtn label="Press" icon="touch-app" color="#EF4444" onPress={() => onAddBlock({ type: 'event', opcode: 'ON_PRESS', inputs: {}, position: { x: 50, y: 50 } })} />
                            <BlockBtn label="Load" icon="refresh" color="#EF4444" onPress={() => onAddBlock({ type: 'event', opcode: 'ON_LOAD', inputs: {}, position: { x: 50, y: 50 } })} />
                        </Category>
                        <Category label="Actions">
                            <BlockBtn label="Alert" icon="notifications" color="#3B82F6" onPress={() => onAddBlock({ type: 'action', opcode: 'SHOW_ALERT', inputs: { title: 'Hello', message: 'World' }, position: { x: 50, y: 50 } })} />
                            <BlockBtn label="Nav" icon="near-me" color="#3B82F6" onPress={() => onAddBlock({ type: 'action', opcode: 'NAVIGATE', inputs: { screenId: '' }, position: { x: 50, y: 50 } })} />
                            <BlockBtn label="Set" icon="save" color="#3B82F6" onPress={() => onAddBlock({ type: 'action', opcode: 'SET_VARIABLE', inputs: { variableName: '', value: '' }, position: { x: 50, y: 50 } })} />
                            <BlockBtn label="Log" icon="terminal" color="#3B82F6" onPress={() => onAddBlock({ type: 'action', opcode: 'CONSOLE_LOG', inputs: { message: '' }, position: { x: 50, y: 50 } })} />
                        </Category>
                        <Category label="Control">
                            <BlockBtn label="If/Else" icon="call-split" color="#F59E0B" onPress={() => onAddBlock({ type: 'control', opcode: 'IF_ELSE', inputs: { condition: '', trueBlockId: '', falseBlockId: '' }, position: { x: 50, y: 50 } })} />
                        </Category>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

import { ScrollView } from 'react-native';

function Category({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>{children}</View>
        </View>
    );
}

function BlockBtn({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.toolbarBtn, { backgroundColor: color + '20', borderColor: color }]}>
            <MaterialIcons name={icon as any} size={16} color={color} />
            <Text style={[styles.toolbarBtnText, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    closeBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    addBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    gridBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#00000005', // Subtle grid pattern emulation
    },
    toolbar: {
        borderTopWidth: 1,
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    toolbarContent: {
        alignItems: 'flex-start',
        gap: 20,
        paddingRight: 40,
    },
    toolbarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    toolbarBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
