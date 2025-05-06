import { StyleSheet } from 'react-native';

export const gradientColors: [string, string] = ['#a1c4fd', '#c2e9fb'];

export const sharedStyles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
    input: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#ccc' },
    button: { backgroundColor: '#4f46e5', paddingVertical: 12, borderRadius: 25, alignItems: 'center', marginVertical: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    card: { flex: 1, margin: 8, backgroundColor: '#ffffffcc', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3, alignItems: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messageContainer: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
      },
      buyerMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#d1f7c4',
      },
      sellerMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
      },
      messageText: {
        fontSize: 16,
      },
      inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
      },
      sendButton: {
        backgroundColor: '#4f46e5',
        padding: 12,
        borderRadius: 25,
        marginLeft: 10,
      }, 
      caption: {
        fontSize: 16,
        fontWeight: '500',
        marginVertical: 4,
        textAlign: 'center',
      },
      imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
      },          
  });
  
