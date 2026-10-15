import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { Session } from "../../../../../core/auth/session";
import { API_URL } from "../../../../../core/http/api-url";
import { Overview } from "./overview";
const summary = {
  as_of: "2026-10-10",
  period_from: "2026-10-01",
  period_to: "2026-10-10",
  herd: { total: 5, active: 4, exited: 1, female: 3, male: 1 },
  health: null,
  breeding: null,
  finance: null,
  feeding: null,
  activity: [],
};
describe("Ranch overview", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Overview],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Session,
          useValue: { user: () => ({ permissions: ["animals:read"] }) },
        },
      ],
    }).compileComponents();
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it("shows real counts and hides areas without access", async () => {
    const f = TestBed.createComponent(Overview);
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne(`${TestBed.inject(API_URL)}/dashboard/summary`)
      .flush(summary);
    await expect
      .poll(() => {
        f.detectChanges();
        return f.nativeElement.querySelector("[data-testid=herd-summary]")
          ?.textContent;
      })
      .toContain("4");
    expect(
      f.nativeElement.querySelector("[data-testid=finance-summary]"),
    ).toBeNull();
    expect(f.nativeElement.textContent).toContain("3 hembras");
  });
  it("shows an error and retries", async () => {
    const f = TestBed.createComponent(Overview);
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const url = `${TestBed.inject(API_URL)}/dashboard/summary`;
    http.expectOne(url).flush({}, { status: 503, statusText: "Unavailable" });
    await expect
      .poll(() => {
        f.detectChanges();
        return !!f.nativeElement.querySelector("[role=alert]");
      })
      .toBe(true);
    [...f.nativeElement.querySelectorAll("button")]
      .find((b: any) => b.textContent.includes("Reintentar"))!
      .click();
    http.expectOne(url).flush({ ...summary, herd: null });
    await expect
      .poll(() => {
        f.detectChanges();
        return f.nativeElement.textContent;
      })
      .toContain("Tu rol todavía");
  });
});
