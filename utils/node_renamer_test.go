package utils

import "testing"

func TestISOToFlagPreservesCountryCode(t *testing.T) {
	for _, tc := range []struct{ code, flag string }{
		{"TW", "🇹🇼"}, {"tw", "🇹🇼"}, {"CN", "🇨🇳"},
		{"HK", "🇭🇰"}, {"US", "🇺🇸"}, {"", "🏳️"},
		{"T", "🏳️"}, {"T1", "🏳️"},
	} {
		t.Run(tc.code, func(t *testing.T) {
			if got := ISOToFlag(tc.code); got != tc.flag {
				t.Errorf("ISOToFlag(%q) = %q, want %q", tc.code, got, tc.flag)
			}
		})
	}
}
