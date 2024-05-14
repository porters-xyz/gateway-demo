import { Container, Grid } from "@mantine/core";
import SectionTitle from "./common/SectionTitle";
import heroImage from "@frontend/public/hero_image.png";
import FeatureBlock from "./common/FeatureBlock";
import devCentricity from "@frontend/public/centricity.png";
import depin from "@frontend/public/depin.png";
import scale from "@frontend/public/scale.png";
import noRamp from "@frontend/public/no-ramp.png";

export default function WhyOurRPC() {
    return (
        <Container size="md" mt={"xl"}>
            <SectionTitle title="Why Our RPC?" />
            <Grid align="center" justify="center" m={40}>
                <FeatureBlock
                    image={depin}
                    title="DePIN Made Easy"
                    description="Connect your project to POKT’s powerful DePIN network. The PORTERS gateway abstracts away the Protocol enabling easy access to unstoppable decentralized data."
                />
                <FeatureBlock
                    image={devCentricity}
                    title="Developer Centricity"
                    description="PORTERS offers a plug-and-play developer experience.
                    We make collaboration and sharing easy for everyone without sacrificing security and permissions management."
                />

                <FeatureBlock
                    image={scale}
                    title="Scalable Tooling"
                    description="PORTERS provides scalable and robust developer tooling.
                    Adjusting RPC usage to your needs when you need it. Never worry about data availability or API key permissions again."
                />

                <FeatureBlock
                    image={noRamp}
                    title="No Ramps Needed"
                    description="At PORTERS we want you to be flexible. You can simply swap your favourite token to PORTERS and get your RPC endpoint funded instantly.
          No credit card needed, no hidden fees, and no vendor lock-in."
                />
            </Grid>
        </Container>
    );
}
