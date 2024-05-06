import { Modal, Button, Divider } from "@mantine/core";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useAtomValue } from "jotai";
import { billingHistoryAtom } from "@frontend/utils/atoms";
import _ from "lodash";
import {
  Document,
  Page,
  Text,
  Image,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import logo from "@frontend/public/porter-footer-logo.png";
import { crimson } from "@frontend/utils/theme";
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#F6EEE6",
  },
  section: {
    flexGrow: 1,
  },
  text: {
    fontSize: 12,
    marginLeft: 20,
    marginTop: 10,
  },
  image: {
    top: 20,
    left: "45%",
    width: 267 * 0.3,
    height: 150 * 0.3,
  },
  separator: {
    borderBottomColor: "#3C2B27",
    opacity: 0.9,
    borderBottomWidth: "1.5",
    width: "100%",
    left: 18,
    marginBottom: 10,
  },
});

export default function InvoicePreview() {
  const router = useRouter();
  const params = useSearchParams();
  const path = usePathname();
  const invoiceId = params?.get("download") as string;

  const billingHistoryData = useAtomValue(billingHistoryAtom);
  const currentInvoice = _.find(billingHistoryData, {
    id: invoiceId,
  });

  return (
    <Modal
      opened={Boolean(invoiceId)}
      onClose={() => router.replace(path as string)}
      title={"Download Invoice"}
      size={"xl"}
      centered
    >
      <PDFViewer width="100%" height={800}>
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.section}>
              <Image src={logo.src} style={styles.image} alt="Porters Logo" />
              <View style={{ marginTop: 40, ...styles.separator }} />

              <Text style={styles.text}>
                {`Transaction Id:`}{" "}
                <Text style={{ ...styles.text, opacity: 0.5 }}>
                  {currentInvoice?.referenceId}
                </Text>
              </Text>
              <Text style={styles.text}>
                {`Amount:`}{" "}
                <Text style={{ ...styles.text, opacity: 0.5 }}>
                  {currentInvoice?.amount}
                </Text>
              </Text>
              <Text style={styles.text}>
                {`Transaction Type:`}{" "}
                <Text style={{ ...styles.text, opacity: 0.5 }}>
                  {currentInvoice?.transactionType}
                </Text>
              </Text>
              {currentInvoice?.productId && (
                <Text style={styles.text}>
                  {`Amount:`}{" "}
                  <Text style={{ ...styles.text, opacity: 0.5 }}>
                    {currentInvoice?.productId}
                  </Text>
                </Text>
              )}
              <View style={{ marginTop: 20, ...styles.separator }} />
            </View>
            <View style={styles.section}></View>
          </Page>
        </Document>
      </PDFViewer>
    </Modal>
  );
}
