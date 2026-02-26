from .mock_sis import fetch_all_accounts


class SISAdapter:
    """
    The only file that changes when the real SIS is connected.
    Everything else in the system calls this, never the mock directly.
    """

    def fetch_accounts(self) -> list[dict]:
        # FUTURE: replace this line with a real API call or DB query
        # e.g. return self._fetch_from_api("https://sis.anu.ac.ke/api/students")
        return fetch_all_accounts()
