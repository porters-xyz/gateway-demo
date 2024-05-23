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
  Font,
  View,
  StyleSheet,
  PDFViewer,
  Link,
} from "@react-pdf/renderer";
import logo from "@frontend/public/porter-footer-logo.png";
// @ts-ignore
import  karlaMedium from "@frontend/public/assets/Karla-Medium.ttf";
// @ts-ignore
import karlaRegular from "@frontend/public/assets/Karla-Regular.ttf";

Font.register({
  family: "Karla-Medium",
  src: karlaMedium,
});

Font.register({
  family: "Karla-Regular",
  src: karlaRegular,
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Karla-Regular",
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
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: "#3C2B27",
                    marginTop: 32,
                    fontFamily: "Karla-Medium",
                  }}
                >
                  Invoice
                </Text>
                <Link href="https://porters.xyz">
                  <Image
                    style={styles.image}
                    src={logo.src}
                  />
                </Link>
              </View>

              <View
                style={{
                  borderTop: 0.5,
                  marginHorizontal: 32,
                  marginTop: 32,
                  marginBottom: 18,
                  borderTopColor: "#3C2B27",
                }}
              />

              <View style={{ marginHorizontal: 32, flexDirection: "row" }}>
                <View
                  style={{
                    flexDirection: "column",
                    gap: 5,
                    fontWeight: 500,
                    fontSize: 14,
                    fontFamily: "Karla-Medium",
                  }}
                >
                  <Text>Invoice Number</Text>
                  <Text>Transaction Id</Text>
                  <Text>Paid to</Text>
                  <Text>Date Paid</Text>
                </View>

                <View
                  style={{
                    flexDirection: "column",
                    gap: 5,
                    fontWeight: 500,
                    fontSize: 14,
                    marginLeft: 24,
                  }}
                >
                  <Text>{currentInvoice?.id}</Text>
                  <Text>{currentInvoice?.referenceId}</Text>
                  <Text>Porters.xyz</Text>
                  <Text>
                    {new Date(currentInvoice?.createdAt!).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  borderTop: 0.5,
                  marginHorizontal: 32,
                  marginTop: 18,
                  marginBottom: 10,
                  borderTopColor: "#3C2B27",
                }}
              />
              <View
                style={{
                  marginHorizontal: 32,
                  fontSize: 12,
                  fontWeight: 400,
                  gap: 3,
                }}
              >
                <Text>Data Gateways LLC</Text>
                <Text>30 N Gould St Ste R</Text>
                <Text>Sheridan, WY 82801</Text>
                <Text>United States</Text>
              </View>
              <View
                style={{
                  marginTop: 54,
                  marginHorizontal: 32,
                  fontSize: 12,
                  fontWeight: 400,
                  paddingHorizontal: 10,
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <View style={{ gap: 10 }}>
                  <Text>Description</Text>
                  <Text style={{ fontFamily: "Karla-Medium" }}>RPC Relays</Text>
                </View>
                <View style={{ gap: 10 }}>
                  <Text>Qty</Text>
                  <Text style={{ fontFamily: "Karla-Medium" }}>
                    {Number(currentInvoice?.amount) / 1000}
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  <Text>Amount (Token spent)</Text>
                  <Text style={{ fontFamily: "Karla-Medium" }}>
                    PORTR {Number(currentInvoice?.amount) * 10 ** -6}
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  <Text>Amount (USD)</Text>
                  <Text style={{ fontFamily: "Karla-Medium" }}>
                    {`$` + Number(currentInvoice?.amount) / 10 ** 9}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  borderTop: 0.5,
                  marginHorizontal: 32,
                  marginTop: -18,
                  marginBottom: 10,
                  borderTopColor: "#3C2B27",
                }}
              />
              <View
                style={{
                  marginTop: 100,
                  marginHorizontal: 32,
                  marginLeft: "40%",
                  fontSize: 12,
                  fontWeight: 400,
                  gap: 10,
                }}
              >
                <View
                  style={{
                    borderTop: 0.5,
                    justifyContent: "space-between",
                    flexDirection: "row",
                    paddingTop: 10,
                    paddingRight: 8,
                  }}
                >
                  <Text>Subtotal</Text>
                  <Text style={{ fontFamily: "Karla-Medium" }}>
                    {`$` + Number(currentInvoice?.amount) / 10 ** 9}
                  </Text>
                </View>

                <View
                  style={{
                    justifyContent: "space-between",
                    flexDirection: "row",
                    borderTop: 0.5,
                    paddingTop: 10,
                    paddingRight: 8,
                  }}
                >
                  <Text>Total</Text>
                  <Text style={{ fontFamily: "Karla-Medium" }}>
                    {`$` + Number(currentInvoice?.amount) / 10 ** 9}
                  </Text>
                </View>

                <View
                  style={{
                    justifyContent: "space-between",
                    flexDirection: "row",
                    borderTop: 0.5,
                    paddingTop: 10,
                    paddingRight: 8,
                    fontFamily: "Karla-Medium",
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>Amount Paid</Text>
                  <Text>{`$` + Number(currentInvoice?.amount) / 10 ** 9}</Text>
                </View>
              </View>

              <View
                style={{
                  justifyContent: "space-between",
                  width: "90%",
                  marginHorizontal: 32,
                  flexDirection: "row",
                  borderTop: 0.5,
                  paddingTop: 10,
                  paddingRight: 8,
                  position: "absolute",
                  bottom: 20,
                  fontSize: 8,
                }}
              >
                <Link
                  href="https://porters.xyz"
                  style={{ textDecoration: "none", color: "#3C2B27" }}
                >
                  Porters.xyz
                </Link>

                <Text>Page 1</Text>
              </View>
            </View>
            <View
              style={{
                width: 12,
                backgroundColor: "#F8DBBE",
              }}
            />
          </Page>
        </Document>
      </PDFViewer>
    </Modal>
  );
}
