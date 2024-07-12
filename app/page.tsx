import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import EmptyState from "@/app/components/EmptyState";
import Pagination from "@/app/components/Pagination";
import { isMobile as detectMobile } from "@/app/utils/deviceDetector";
import getListings, { IListingsParams } from "@/app/actions/getListings";
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "./components/ClientOnly";
import { headers } from 'next/headers';

interface HomeProps {
  searchParams: IListingsParams
};

const Home = async ({ searchParams }: HomeProps) => {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = detectMobile(userAgent);
  const limit = isMobile ? 6 : 10;
  const listingsData = await getListings({ ...searchParams, limit });
  const currentUser = await getCurrentUser();

  if (listingsData.listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
            gap-8
          "
        >
          {listingsData.listings.map((listing) => (
            <ListingCard
              key={listing.id}
              data={listing}
              currentUser={currentUser}
            />
          ))}
        </div>
        <Pagination
          totalPages={listingsData.totalPages}
          currentPage={listingsData.currentPage}
          searchParams={searchParams}
        />
      </Container>
    </ClientOnly>
  )
}

export default Home;
