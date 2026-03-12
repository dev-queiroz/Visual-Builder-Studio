import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { LogicBlock } from '@/types';
import { AppColors } from '@/constants/colors';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, TextInput } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

interface Props {
    block: LogicBlock;
    onSelect: (id: string) => void;
    onUpdateInput?: (id: string, key: string, value: any) => void;
    onDrag?: (id: string, x: number, y: number) => void;
    isSelected?: boolean;
}

export default function LogicBlockView({ block, onSelect, onUpdateInput, onDrag, isSelected }: Props) {
    const isDark = useColorScheme() === 'dark';
    const theme = isDark ? AppColors.dark : AppColors.light;

    const dragX = useSharedValue(block.position.x);
    const dragY = useSharedValue(block.position.y);

    const pan = Gesture.Pan()
        .onUpdate((e) => {
            dragX.value = block.position.x + e.translationX;
            dragY.value = block.position.y + e.translationY;
        })
        .onEnd(() => {
            if (onDrag) {
                runOnJS(onDrag)(block.id, dragX.value, dragY.value);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        left: dragX.value,
        top: dragY.value,
        transform: [{ scale: isSelected ? 1.02 : 1 }],
    }));

    const getBlockIcon = () => {
        switch (block.opcode) {
            case 'SHOW_ALERT': return 'notifications';
            case 'NAVIGATE': return 'near-me';
            case 'SET_VARIABLE': return 'save';
            case 'IF_ELSE': return 'call-split';
            case 'CONSOLE_LOG': return 'terminal';
            case 'ON_PRESS': return 'touch-app';
            case 'ON_LOAD': return 'refresh';
            default: return block.type === 'event' ? 'bolt' : 'code';
        }
    };

    const getBlockColor = () => {
        switch (block.type) {
            case 'event': return '#EF4444'; // Red
            case 'action': return '#3B82F6'; // Blue
            case 'control': return '#F59E0B'; // Amber
            case 'data': return '#10B981'; // Green
            case 'operator': return '#7C3AED'; // Violet
            default: return '#6B7280';
        }
    };

    const blockColor = getBlockColor();

    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                style={[
                    styles.container,
                    animatedStyle,
                    {
                        backgroundColor: blockColor,
                        borderColor: isSelected ? '#FFF' : 'rgba(255,255,255,0.3)',
                        borderWidth: isSelected ? 3 : 1,
                        zIndex: isSelected ? 1000 : 1,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => onSelect(block.id)}
                    activeOpacity={0.9}
                    style={{ flex: 1 }}
                >
                    <View style={styles.header}>
                        <MaterialIcons name={getBlockIcon() as any} size={16} color="#FFF" />
                        <Text style={styles.opcode}>{block.opcode.replace('_', ' ')}</Text>
                    </View>
                    <View style={styles.body}>
                        {Object.keys(block.inputs).map((key) => (
                            <View key={key} style={styles.inputRow}>
                                <View style={styles.socket} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>{key}</Text>
                                    {isSelected ? (
                                        <TextInput
                                            value={String(block.inputs[key] ?? '')}
                                            onChangeText={(t) => onUpdateInput?.(block.id, key, t)}
                                            style={styles.inputField}
                                            placeholder="Value..."
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                        />
                                    ) : (
                                        <Text style={styles.inputValue} numberOfLines={1}>
                                            {String(block.inputs[key] ?? '—')}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                    {block.type !== 'event' && <View style={styles.topPlug} />}
                    <View style={styles.bottomPlug} />
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        minWidth: 140,
        borderRadius: 12,
        padding: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    opcode: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    body: {
        gap: 6,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    socket: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    inputLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    inputValue: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    inputField: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        color: '#FFF',
        fontSize: 12,
        marginTop: 2,
    },
    topPlug: {
        position: 'absolute',
        top: -6,
        left: 20,
        width: 15,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    bottomPlug: {
        position: 'absolute',
        bottom: -6,
        left: 20,
        width: 15,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
});
