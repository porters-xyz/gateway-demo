import { Modal } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
  },
  section: {
    flexGrow: 1,
    backgroundColor: "#F6F2EE",
  },
  image: {
    top: 20,
    width: logo.width / 3,
    height: logo.height / 3,
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
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 32,
                  alignItems: "center",
                  justifyContent: "space-between",
                  // fontFamily: karla.style.fontFamily
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: "#3C2B27",
                    marginTop: 32,
                  }}
                >
                  Invoice
                </Text>
                <Image style={styles.image} src={logo.src} alt="Porters Logo" />
              </View>

              <View
                style={{ borderTop: 1, margin: 32, borderTopColor: "#3C2B27" }}
              />

              {/*  Invoice Number */}
              <View style={{ marginHorizontal: 32 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontWeight: 700, fontSize: 12 }}>
                    Invoice Number:
                  </Text>
                  <Text
                    style={{ fontWeight: 500, fontSize: 12, marginLeft: 15 }}
                  >
                    {currentInvoice?.id}
                  </Text>
                </View>
              </View>

              {/*  Transaction Id */}
              <View style={{ marginHorizontal: 32 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontWeight: 700, fontSize: 12 }}>
                    Transaction Id:
                  </Text>
                  <Text
                    style={{ fontWeight: 500, fontSize: 12, marginLeft: 15 }}
                  >
                    {currentInvoice?.referenceId}
                  </Text>
                </View>
              </View>

              {/* Paid To */}
              <View style={{ marginHorizontal: 32 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontWeight: 700, fontSize: 12 }}>
                    Paid by:
                  </Text>
                  <Text
                    style={{ fontWeight: 500, fontSize: 12, marginLeft: 15 }}
                  >
                    Porters.xyz
                  </Text>
                </View>
              </View>

              {/* Date Paid */}
              <View style={{ marginHorizontal: 32 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontWeight: 700, fontSize: 12 }}>
                    Date Paid:
                  </Text>
                  <Text
                    style={{ fontWeight: 500, fontSize: 12, marginLeft: 15 }}
                  >
                    {new Date(currentInvoice?.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View
                style={{ borderTop: 1, margin: 32, borderTopColor: "#3C2B27" }}
              />
              <View style={{ marginHorizontal: 32, fontSize: 10 }}>
                <Text>Data Gateways LLC</Text>
                <Text>30 N Gould St Ste R</Text>
                <Text>Sheridan, WY 82801</Text>
                <Text>United States</Text>
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </Modal>
  );
}
