import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage, fire } from "../Firebase";
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

export default function Home() {
    const [img, setImg] = useState("");
    const [file, setFile] = useState([]);
    const [textInputs, setTextInputs] = useState({
        text1: "",
        text2: "",
        text3: "",
        text4: ""
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(fire, "files"), (snapshot) => {
            const files = [];
            snapshot.forEach(doc => {
                files.push({ ...doc.data(), id: doc.id });
            });
            setFile(files);
        });
        return () => unsubscribe();
    }, []);

    async function uploadImage(uri, fileType) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, "images/" + fileType);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on(
            "state_changed",
            async () => {
                if (uploadTask && uploadTask.snapshot) {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await saveRecord(fileType, downloadURL, new Date().toISOString());
                    setImg("");
                }
            }
        );
    }

    async function saveRecord(fileType, url, createdAt) {
        try {
            await addDoc(collection(fire, "files"), {
                fileType,
                url,
                createdAt,
                ...textInputs
            });
        } catch (e) {
            console.log(e);
        }
    }

    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImg(result.assets[0].uri);
            await uploadImage(result.assets[0].uri, "image");
        }
    };

    const handleTextChange = (text, field) => {
        setTextInputs(prevState => ({ ...prevState, [field]: text }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TextInput
                        style={styles.input}
                        placeholder="Texto 1"
                        value={textInputs.text1}
                        onChangeText={(text) => handleTextChange(text, "text1")}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Texto 2"
                        value={textInputs.text2}
                        onChangeText={(text) => handleTextChange(text, "text2")}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Texto 3"
                        value={textInputs.text3}
                        onChangeText={(text) => handleTextChange(text, "text3")}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Texto 4"
                        value={textInputs.text4}
                        onChangeText={(text) => handleTextChange(text, "text4")}
                    />
                    <TouchableOpacity
                        onPress={pickImage}
                        style={styles.botao}
                    >
                        <Text style={styles.btn}>
                            Selecionar Imagem
                        </Text>
                    </TouchableOpacity>
                </View>
                {file.map((item) => (
                    <View key={item.id} style={styles.itemContainer}>
                        {item.fileType === "image" && (
                            <Image
                                source={{ uri: item.url }}
                                style={styles.images}
                            />
                        )}
                        <Text>{item.text1}</Text>
                        <Text>{item.text2}</Text>
                        <Text>{item.text3}</Text>
                        <Text>{item.text4}</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        width: 300,
        paddingHorizontal: 10,
    },
    btn: {
        textAlign: 'center',
        color: '#fff'
    },
    botao: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: 'purple',
        width: 150,
        height: 50,
        marginTop: 20
    },
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
    },
    images: {
        width: 150,
        height: 150,
    }
});
